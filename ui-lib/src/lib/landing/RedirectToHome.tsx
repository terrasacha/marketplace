import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
interface RedirectToHomeProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: string
}
const optionsToDisplay : any = {
  hasTokenAuth:{
    title: 'Billetera encontrada',
    paragraph: 'Se ha encontrado una billetera asociada a este usuario',
  },
  requestToken:{
    title: 'Debes solicitar tu token de acceso',
    paragraph: 'Para ingresar al marketplace primero debes solicitar tu token de acceso. Una vez lo tengas en tu billetera, podrás ingresar al marketplace.',
  },
  notBalance:{
    title: 'No tienes balance suficiente',
    paragraph: 'Si creaste tu billetera recientemente probablemente no poseas fondos suficientes para hacerte de tu token de acceso. Tranquilo, puedes fondear tu billetera haciendo click en el siguiente botón.',
  }
}
const RedirectToHome = (props: RedirectToHomeProps) => {
  const { poweredby, appName, checkingWallet} = props;
  const router = useRouter();
  useEffect(() => {
    /* router.push('/home'); */
  }, []);
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <h2 className="text-3xl font-normal pb-4 flex justify-center">
       {optionsToDisplay[checkingWallet]?.title}
      </h2>
      <p className="text-sm font-light text-gray-500 text-center mb-8">
      {optionsToDisplay[checkingWallet]?.paragraph}
      </p>
      {checkingWallet === 'hasTokenAuth' &&
        <div className="flex text-xs gap-2 items-center justify-center">
          <TailSpin width="15" color="#0e7490" wrapperClass="" />
          <p>Redirigiendo a marketplace</p>
        </div>
        }
      {checkingWallet === 'requestToken' &&
                <button className="relative w-full flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
                  Solicitar token
                </button>
        }
      {checkingWallet === 'notBalance' &&
                <button className="relative w-full flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2">
                  Fondear billetera
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
