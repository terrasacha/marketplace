// components/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import Image from 'next/image';
import { useWallet } from '@meshsdk/react';
import { CardanoWalletGeneric } from '../ui-lib';
interface WelcomeCardProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: any;
  handleSetCheckingWallet: any
}
const WelcomeCard = (props: WelcomeCardProps) => {
  const { poweredby, appName, checkingWallet, handleSetCheckingWallet } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(null) as any;
  const { disconnect } = useWallet();

  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      setIsAuthenticated(res);
    });
  }, []);
  useEffect(() => {
    if(checkingWallet === 'unauthorized'){
      setTimeout(() => {
        disconnect()
        handleSetCheckingWallet('uncheck')
      }, 1500);
    }
  }, [checkingWallet]);

  async function currentAuthenticatedUser() {
    try {
      const { userId } = await getCurrentUser();
      if (userId) return userId;
    } catch (err) {
      return false;
    }
  }
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <h2 className="text-3xl font-normal pb-4 flex justify-center">
        Conecta tu billetera
      </h2>
      <p className="flex text-xs text-center ">
        Para operar en la página debes conectar una billetera validada por la
        organización. Si deseas vincular tu billetera por favor contáctate con
        nuestro centro de ayuda
      </p>
      <p
        className={`h-16 flex justify-center items-center text-sm ${
          checkingWallet === 'unauthorized' ? 'text-red-400' : 'text-slate-600'
        }`}
      >
        {/* {checkingWallet === 'uncheck'? '': checkingWallet} */}
        {checkingWallet === 'checking' ? 'Cargando...' : ''}
        {checkingWallet === 'authorized'
          ? 'Billetera autorizada. Redirigiendo...'
          : ''}
        {checkingWallet === 'unauthorized' ? 'Billetera no autorizada.' : ''}
      </p>
      <p className="text-sm pt-1 pb-4 w-full text-center">
        ¿Quieres solicitar tu billetera?{' '}
        <Link
          href="https://suan-1.gitbook.io/documentacion-suan-sandbox"
          target="_blank"
          className="text-[#50A4FF] text-sm"
        >
          Ingresa aquí
        </Link>
      </p>
      <Link
        href={
          isAuthenticated
            ? '/generate-wallet'
            : '/auth/login?fromGenerateWallet=true'
        }
      >
        <button className="relative w-full flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
          Generar billetera
        </button>
      </Link>
      {isAuthenticated && (
        <Link
          href='/restore-wallet'
        >
          <button className="flex h-10 w-full items-center justify-center p-0.5 font-normal focus:z-10 focus:outline-none text-gray-900 border border-gray-300 enabled:hover:bg-gray-100 focus:ring-cyan-300 :bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2 mt-2">
            Recuperar billetera
          </button>
        </Link>
      )}
      {!isAuthenticated && (
        <CardanoWalletGeneric text="Acceder con billetera externa" checkingWallet={checkingWallet} />
      )}
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

export default WelcomeCard;
