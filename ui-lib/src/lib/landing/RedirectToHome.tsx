import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { toast } from 'sonner';
import { useWallet, useAssets } from '@meshsdk/react'

interface RedirectToHomeProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: string
  walletData: any
  handleSetCheckingWallet: (data : string) => void
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
    paragraph: 'Ten en cuenta que el token puede tardar hasta tres minutos en impactar en tu billetera. Espere mientras validamos la información',
  }
}
const RedirectToHome = (props: RedirectToHomeProps) => {
  const { poweredby, appName, checkingWallet, walletData , handleSetCheckingWallet } = props;
  const [loading, setLoading] = useState<boolean>(false)
  const [statusText, setStatusText] = useState<string>('Validando token en billetera')
  const [showButtonAccess, setShowButtonAccess] = useState<boolean>(false)
  const [claimed, setClaimed] = useState<boolean>(false)
  const assets = useAssets() as Array<{ [key: string]: any }>
  
  const router = useRouter();

  useEffect(() => {
    let tokenFound = false; // Bandera para indicar si se ha encontrado el token
    if (checkingWallet === 'hasTokenAuth') {
      router.push('/home');
    }
    const interval = setInterval(async () => {
      if (!tokenFound && checkingWallet === 'alreadyClaimToken') { // Solo si el token no ha sido encontrado aún
        setLoading(true);
        try {
          const balanceData = await getWalletBalanceByAddress(walletData.address);
          const hasTokenAuth = balanceData[0].assets.some((asset: any) => asset.policy_id === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
              asset.asset_name === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME);
          if (hasTokenAuth) {
            setLoading(false);
            setStatusText('Token encontrado, redirigiendo...');
            setShowButtonAccess(true);
            tokenFound = true; // Establecer la bandera a true cuando se encuentra el token
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error al obtener el saldo de la billetera:', error);
          setLoading(false);
        }
      }
    }, 8000);
  
    return () => clearInterval(interval);
  }, [checkingWallet]);
  


  

  const getWalletBalanceByAddress = async (address: any) =>{
    const balanceFetchResponse = await fetch('/api/calls/backend/getWalletBalanceByAddress', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
  })

  const balanceData = await balanceFetchResponse.json()
  return balanceData
  }

  const requestToken = async () => {
    if (walletData) {
      let payload = walletData.address
      try {
        setLoading(true);
        const response = await fetch(`api/helpers/requestAccessToken?destinAddress=${payload}`,{
          method: 'GET',
        })
        
        const data = await response.json()
        if(!data.detail){        
          const response2 = await fetch('api/calls/backend/walletClaimToken',{
            method: 'POST',
            body: JSON.stringify({
              id: walletData.id
            }),
          })
          const data2 = response2.json()
          setClaimed(true)
          return handleSetCheckingWallet('alreadyClaimToken')
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
      <p className="text-sm font-light text-gray-500 text-center mb-2">
      {optionsToDisplay[checkingWallet]?.paragraph}
      </p>
      <div className='h-8 w-full mb-6'>
      {checkingWallet === 'alreadyClaimToken' && loading &&
      <div className="w-full flex text-md gap-2 items-center justify-center">
        <TailSpin width="10" color="#0e7490" wrapperClass="" />
        <p className='text-sm font-light text-gray-500'>{statusText}</p>
      </div>
      }
      {showButtonAccess &&
          <button onClick={() =>router.push('/home')} className="relative w-full h-10 mt-4 flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
            Acceder
          </button>
      }
      </div>
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
