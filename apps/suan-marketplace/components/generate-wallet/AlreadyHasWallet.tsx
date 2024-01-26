import React, { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
const AlreadyHasWallet = (props: any) => {
  const router = useRouter();
  useEffect(() => {
    router.push('/home');
  }, []);
  return (
    <div className="bg-white rounded-2xl py-10 px-12 sm:px-8  flex flex-col justify-center">
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-semibold  w-full">
          Usted ya posee una billetera a su nombre
        </h2>
      </section>
      <p className="pb-2 text-gray-500 text-sm">
        Ya existe una billetera creada a su nombre. Ingrese al marketplace para
        ver la información de la misma.
      </p>
      <div className="flex text-md gap-2 items-center justify-start">
        <TailSpin width="20" color="#0e7490" wrapperClass="" />
        <p>Redirigiendo a marketplace...</p>
      </div>
    </div>
  );
};

export default AlreadyHasWallet;
