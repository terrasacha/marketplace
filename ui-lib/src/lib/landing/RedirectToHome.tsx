import { useState, useEffect } from 'react';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import Image from 'next/image';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
import { useAssets } from '@meshsdk/react';
import { event } from '../common/event';
import { toast } from 'sonner';
import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
});

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

interface RedirectToHomeProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: string;
  walletData: any;
  handleSetCheckingWallet: (data: string) => void;
}

const optionsToDisplay: any = {
  hasTokenAuth: {
    title: 'Token de autorización encontrado',
    paragraph: 'Redirigiendo al marketplace...',
  },
  requestToken: {
    title: 'Último paso, solicitar tu token de acceso',
    paragraph: 'Para acceder al Marketplace, necesitas solicitar primero tu token de acceso. Una vez recibido y disponible en tu billetera, podrás ingresar al Marketplace. Ten en cuenta que puede llevar algún tiempo hasta que el token esté listo en tu billetera. Por favor, espera mientras verificamos la recepción del token.',
  },
  alreadyClaimToken: {
    title: 'Ya enviamos el token de acceso a tu billetera',
    paragraph: 'Con este token podrás acceder al marketplace y comenzar a operar. Por favor, espera mientras validamos la transacción.',
  }
};

const RedirectToHome = (props: RedirectToHomeProps) => {
  const { poweredby, appName, checkingWallet, walletData, handleSetCheckingWallet } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Validando token en billetera');
  const [showButtonAccess, setShowButtonAccess] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [tryAgainAccessToken, setTryAgainAccessToken] = useState<boolean>(false);
  
  const assets = useAssets() as Array<{ [key: string]: any }>;
  
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect ejecutado. checkingWallet:', checkingWallet, 'walletData:', walletData, 'claimed:', claimed);
    if (walletData && !claimed) {
      console.log('Comenzando el proceso de solicitud de token...');
      requestToken();
    }
  }, [walletData, checkingWallet]);

  const getWalletBalanceByAddress = async (address: any) => {
    const balanceFetchResponse = await fetch('/api/calls/backend/getWalletBalanceByAddress', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });

    const balanceData = await balanceFetchResponse.json();
    console.log('Balance data:', balanceData);
    return balanceData;
  };

  const sendMessageToSQS = async (address: string) => {
    const queueUrl = process.env.NEXT_PUBLIC_SQS_QUEUE_URL;

    if (!queueUrl) {
      console.error('SQS Queue URL is not defined');
      throw new Error('SQS Queue URL is not defined');
    }

    const messageBody = {
      method: 'AccessTokens',
      params: {
        address: address
      }
    };

    const params = {
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: queueUrl,
      MessageGroupId: "walletRequestGroup",
    };

    try {
      const data = await sqs.sendMessage(params).promise();
      console.log("Mensaje enviado a SQS:", data.MessageId);
      return data.MessageId;
    } catch (error) {
      console.error("Error al enviar mensaje a SQS:", error);
      throw error;
    }
  };

  const requestToken = async () => {
    if (walletData) {
      try {
        console.log('Enviando mensaje a SQS con address:', walletData.address);
        setLoading(true);
        await sendMessageToSQS(walletData.address);
        setClaimed(true);
        handleSetCheckingWallet('alreadyClaimToken');
        console.log('Mensaje enviado correctamente a SQS.');
        setLoading(false);
      } catch (error) {
        console.error('Error al enviar el mensaje a SQS:', error);
        toast.warning('Error al intentar enviar el token. Reintente más tarde.');
        setLoading(false);
      }
    }
  };

  /* const retryAccessToken = async () => {
    setTryAgainAccessToken(false)

    if (walletData) {
      let payload = walletData.address;
      try {
          setLoading(true)
          const response = await fetch(`api/helpers/requestAccessToken?destinAddress=${payload}`, {
            method: 'GET',
          });
          toast.success('Solicitud de token enviada nuevamente.')

        } catch (error) {
          toast.warning('Error al intentar enviar el token. Reintente más tarde.')
          setLoading(false)
        }
        setLoading(false)
    }
  } */

  return (
    <div className="bg-white rounded-2xl w-[40rem] max-w-[35rem] 2xl:w-[45%] py-10 px-10 sm:px-10 h-auto flex flex-col justify-center">
      <h2 className="text-2xl font-normal pb-4 flex justify-center text-center">
        {optionsToDisplay[checkingWallet]?.title}
      </h2>
      <p className="text-sm text-gray-500 text-center mb-2">
        {optionsToDisplay[checkingWallet]?.paragraph}
      </p>
      <div className='h-8 w-full mb-6'>
        {checkingWallet === 'alreadyClaimToken' && loading &&
        <div className="w-full flex text-md gap-2 items-center justify-center">
          <TailSpin width="10" color="#0e7490" wrapperClass="" />
          <p className='text-sm text-gray-500'>{statusText}</p>
        </div>
        }
        {/* {tryAgainAccessToken &&
          <button onClick={() => retryAccessToken()} className="relative w-full h-10 flex items-center justifycenter font-normal focus:z-10 focus:outline-none textwhite bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
              Reintentar envío
        </button>
        } */}
        {showButtonAccess &&
        <button onClick={() => router.push('/home')} className="relative w-full h-10 mt-4 flex items-center justifycenter font-normal focus:z-10 focus:outline-none textwhite bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
          Acceder
        </button>
        }
      </div>
      {checkingWallet === 'hasTokenAuth' &&
        <div className="flex text-xs gap-2 items-center justifycenter">
          <TailSpin width="30" color="#0e7490" wrapperClass="" />
        </div>
      }
      {(checkingWallet === 'requestToken' && !walletData.claimed_token) &&
        <button onClick={() => requestToken()} disabled={claimed} className="relative w-full h-10 flex items-center justifycenter font-normal focus:z-10 focus:outline-none textwhite bg-cyan-700 border bordertransparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
          {loading ? (
            <TailSpin
              width="20"
              color="#fff"
              wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            'Solicitar token'
          )}
        </button>
      }
      {checkingWallet !== 'hasTokenAuth' &&
        <button className="flex h-10 w-full text-sm items-center justifycenter p-0.5 font-normal focus:z-10 focus:outline-none textred-400 enabled:hover:bg-red-100 focus:ring-red-600 dark:enabled:hover:bg-red-600 dark:focus:ring-gray-600 rounded-lg focus:ring-2 mt-6"
          onClick={() => {
            signOut().then(() => router.reload());
          }}
        >
          Cerrar sesión 
        </button>
      }
      {poweredby && (
        <div className="flex items-center justify-center mt-4 text-xs">
          Powered by
          <Image
            src="/images/home-page/suan_logo.png"
            height={10}
            width={12}
            className="ml-2"
            alt={`${appName} logo`}
          />
        </div>
      )}
    </div>
  );
};

export default RedirectToHome;
