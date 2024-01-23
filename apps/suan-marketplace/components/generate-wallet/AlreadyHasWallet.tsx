import React, { useEffect } from 'react';
import Link from 'next/link';
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
        <Link
          href="/"
          className="relative flex h-10 items-center justify-end p-0.5 text-sm font-normal focus:z-10 focus:outline-none text-gray-900 border border-gray-300 enabled:hover:bg-gray-100 focus:ring-cyan-300 :bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2 mt-2 py-2 px-8"
        >
          Volver
        </Link>
      </div>
    </div>
  );
};

export default AlreadyHasWallet;
