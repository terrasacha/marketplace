import React, { useEffect } from 'react';
const AlreadyHasWallet = (props: any) => {
  return (
    <div className="bg-white rounded-2xl py-10 px-12 sm:px-8  flex flex-col justify-center">
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-semibold  w-full">
          Usted ya posee una billetera a su nombre
        </h2>
      </section>
      <p className="pb-4 text-gray-500 text-sm">
        Ya existe una billetera creada a su nombre. Ingrese al marketplace para
        ver la información de la misma.
      </p>

      <div className="flex w-full justify-end mt-6">
        <button className="group flex h-min items-center justify-center p-2 text-center font-medium focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 ml-4">
          Volver
        </button>
      </div>
    </div>
  );
};

export default AlreadyHasWallet;
