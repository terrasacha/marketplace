// components/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import Image from 'next/image';
import { useWallet } from '@meshsdk/react';
import { useRouter } from 'next/router';
import CardanoWalletGeneric from '../cardano-wallet/CardanoWalletGenericButton';
interface WelcomeCardProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: any;
  handleSetCheckingWallet: any;
}
const WelcomeCard = (props: WelcomeCardProps) => {
  const { poweredby, appName, checkingWallet, handleSetCheckingWallet } = props;
  const [userData, setUserData] = useState(null) as any;
  const { disconnect } = useWallet();
  const router = useRouter();
  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      setUserData(res);
    });
  }, []);
  useEffect(() => {
    if (checkingWallet === 'unauthorized') {
      setTimeout(() => {
        disconnect();
        handleSetCheckingWallet('uncheck');
      }, 1500);
    }
  }, [checkingWallet]);

  async function currentAuthenticatedUser() {
    try {
      const user = await getCurrentUser();
      if (user) return user;
    } catch (err) {
      return false;
    }
  }
  return (
    <div className="bg-white rounded-2xl w-[40rem] max-w-[35rem] 2xl:w-[45%] py-10 px-10 sm:px-10 h-auto flex flex-col justify-center">
      <h2 className="text-3xl font-normal pb-4 flex justify-center text-center">
        {userData ? "Crea tu billetera o utiliza una preexistente" : "¡Bienvenido!"}
      </h2>
      {userData? <p className="text-sm text-center">
        {`El siguiente paso es crear tu billetera virtual o utilizar una que hayas creado con anterioridad (asegurese de contar con las mnemonics). 
        Para ello haz click en "Crear billetera" o "Recuperar billetera", allí deberás seguir los requerimientos 
        para luego poder solicitar tu token de acceso y así ingresar al Marketplace.`}
      </p>: 
      <p className="text-sm text-center">
          Para operar en la aplicación necesita una billetera virtual que contenga el token de acceso 
          proporcionado por nuestra organización en su portfolio. Puede crear su billetera directamente en nuestra plataforma, 
          para lo cual deberá crear primero un usuario.{/* , o conectar cualquier billetera externa oficial, recomendamos la utilización de "Eternl". 
          Si desea obtener más detalles sobre cómo crear una billetera en "Eternl", visite este
          <a href="https://suan-1.gitbook.io/documentacion-suan-sandbox"
              target="_blank"
              className="text-[#50A4FF]">enlace</a>. */}
      </p>}

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
      {userData? 
      <Link
        href={
          '/generate-wallet'
        }
      >
        <button className="relative w-full flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
          Crear billetera
        </button>
      </Link>
      : 
      <Link
        href={
          '/auth/login'
        }
      >
        <button className="relative w-full flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
          Ingresar 
        </button>
      </Link>}
      {userData &&
        <Link href="/restore-wallet">
          <button className="flex h-10 w-full items-center justify-center p-0.5 font-normal focus:z-10 focus:outline-none text-gray-900 border border-gray-300 enabled:hover:bg-gray-100 focus:ring-cyan-300 :bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2 mt-2">
            Recuperar billetera
          </button>
        </Link>
      }
      {userData && 
      <button className="flex h-10 w-full text-sm items-center justify-center p-0.5 font-normal focus:z-10 focus:outline-none text-red-400 enabled:hover:bg-red-100 focus:ring-red-600 :bg-red-400 dark:text-white dark:enabled:hover:bg-red-600  dark:focus:ring-gray-600 rounded-lg focus:ring-2 mt-6"
      onClick={() => {
        signOut().then(() => router.reload());
      }}
    >
      Cerrar sesión como {userData.username}
    </button>}
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
