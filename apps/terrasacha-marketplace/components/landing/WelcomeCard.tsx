// components/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { UiLib } from '@marketplaces/ui-lib';
const WelcomeCard = (props: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null) as any;

  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      console.log(res);
      setIsAuthenticated(res);
    });
  }, []);

  async function currentAuthenticatedUser() {
    try {
      const { userId } = await getCurrentUser();
      if (userId) return userId;
    } catch (err) {
      return false;
    }
  }
  let checkingWallet = props.checkingWallet;
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
        <Button className="w-full" color="light">
          Generar billetera
        </Button>
        <UiLib className="bg-red-500" />
      </Link>
    </div>
  );
};

export default WelcomeCard;
