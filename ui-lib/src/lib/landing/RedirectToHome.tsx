import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
interface RedirectToHomeProps {
  poweredby: boolean;
  appName: string;
}
const RedirectToHome = (props: RedirectToHomeProps) => {
  const { poweredby, appName } = props;
  const router = useRouter();
  useEffect(() => {
    router.push('/home');
  }, []);
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <h2 className="text-3xl font-normal pb-4 flex justify-center">
        Billetera encontrada
      </h2>
      <p className="text-sm font-light text-gray-500 text-center mb-8">
        Se ha encontrado una billetera asociada a este usuario
      </p>
      <div className="flex text-xs gap-2 items-center justify-center">
        <TailSpin width="15" color="#0e7490" wrapperClass="" />
        <p>Redirigiendo a marketplace</p>
      </div>
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
