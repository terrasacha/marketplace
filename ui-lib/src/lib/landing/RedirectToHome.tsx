import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { toast } from 'sonner';

interface RedirectToHomeProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: string
  walletData: any
}
const optionsToDisplay : any = {
  hasTokenAuth:{
    title: 'Token de autorización encontrado',
    paragraph: 'Redirigiendo al marketplace...',
  },
  requestToken:{
    title: 'Debes solicitar tu token de acceso',
    paragraph: 'Para ingresar al marketplace primero debes solicitar tu token de acceso. Una vez lo tengas en tu billetera, podrás ingresar al marketplace.',
  },
  alreadyClaimToken:{
    title: 'Ya solicitaste tu token de acceso',
    paragraph: 'Ten en cuenta que el token puede tardar hasta tres minutos en impactar en tu billetera.',
  }
}
const RedirectToHome = (props: RedirectToHomeProps) => {
  const { poweredby, appName, checkingWallet, walletData} = props;
  const [loading, setLoading] = useState<boolean>(false)
  const [claimed, setClaimed] = useState<boolean>(false)
  const router = useRouter();

  useEffect(() => {
    if(checkingWallet === 'hasTokenAuth'){

      router.push('/home');
    }
  }, [checkingWallet]);

  const requestToken = async () => {
    if (walletData) {
      let payload = walletData.address
      try {
        setLoading(true);
        const response = await fetch(`api/calls/backend/requestAccessToken?destinAddress=${payload}`,{
          method: 'GET',
        })
        
        const data = await response.json()
        console.log(data, 'data')
        if(!data.detail){        
          const response2 = await fetch('api/calls/backend/walletClaimToken',{
            method: 'POST',
            body: JSON.stringify({
              id: walletData.id
            }),
          })
          const data2 = response2.json()
          setClaimed(true)
          return toast.success('Se ha enviado el token de acceso correctamente. Ten en cuenta que el token puede tardar hasta tres minutos en aparecer en tu billetera.',{
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error al hacer la solicitud:', error);
      } finally {
        setLoading(false);
      }
    }
  }
  return (
    <div className="bg-white rounded-2xl min-w-[40rem] max-w-[40rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <h2 className="text-3xl font-normal pb-4 flex justify-center">
       {optionsToDisplay[checkingWallet]?.title}
      </h2>
      <p className="text-sm font-light text-gray-500 text-center mb-8">
      {optionsToDisplay[checkingWallet]?.paragraph}
      </p>
      {checkingWallet === 'hasTokenAuth' &&
        <div className="flex text-xs gap-2 items-center justify-center">
          <TailSpin width="30" color="#0e7490" wrapperClass="" />
        </div>
        }
      {(checkingWallet === 'requestToken' && !walletData.claimed_token) &&  
                <button onClick={() => requestToken()} disabled={ claimed } className="relative w-full h-10 flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
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
