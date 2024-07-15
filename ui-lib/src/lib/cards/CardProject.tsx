import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActualPeriod } from '@marketplaces/utils-2';
import Image from 'next/image';
interface CardProjectProps {
  project: any;
}
interface ProductFeature {
  featureID: string;
  value: any;
}

const projectStatusMapper: any = {
  draft: 'En borrador',
  verified: 'Verificado',
  on_verification: 'En verificación',
  in_blockchain: 'En blockchain',
  in_equilibrium: 'En equilibrio',
  Prefactibilidad: 'En Prefactibilidad',
  Factibilidad: 'En Factibilidad',
  'Documento de diseño del proyecto': 'En diseño de documento del proyecto',
  'Validación externa': 'En validación externa',
  'Registro del proyecto': 'Registrado',
};

const CardProject: React.FC<CardProjectProps> = ({ project }) => {
  const [productFeatures, setProductFeatures] = useState<ProductFeature[]>([]);
  useEffect(() => {
    setProductFeatures(project.productFeatures.items);
  }, []);

  const tokenHistoricalData = JSON.parse(
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
    })[0]?.value || '[]'
  );

  const tokenCurrency: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
    })[0]?.value || '';
  const periods = tokenHistoricalData.map((tkhd: any) => {
    return {
      period: tkhd.period,
      date: new Date(tkhd.date),
      price: tkhd.price,
      amount: tkhd.amount,
    };
  });
  const actualPeriod = getActualPeriod(Date.now(), periods);
  const totalTokensSold = project.transactions.items.reduce(
    (acc: any, item: any) => {
      return acc + item.amountOfTokens;
    },
    0
  );

  let relevantInfo = {
    name: project.name
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
    status: projectStatusMapper[project.status],
    dateOfInscription: project.createdAt.split('-')[0],
    category: project.category.name
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
    encodedCategory: encodeURIComponent(project.categoryID),
    tokenTotal: parseInt(actualPeriod?.amount),
    tokenUnits: parseInt(actualPeriod?.amount) - parseInt(totalTokensSold),
    tokenValue: actualPeriod?.price,
    tokenCurrency: tokenCurrency,
  };
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gray-50 h-[30rem] dark:bg-gray-800">
      <div className="relative flex justify-between items-start py-4 px-6 h-[40%] w-full bg-cover rounded-t-2xl rounded-tl-2xl overflow-hidden">
        <Image
          priority={false}
          src={`${process.env['NEXT_PUBLIC_s3EndPoint']}public/category-projects-images/${encodeURIComponent(
            `${project.categoryID}`
          )}.avif`}
          alt="landing-suan-image"
          fill
          style={{
            position: 'absolute',
            objectFit: 'cover',
            objectPosition: 'center bottom',
            zIndex: '0',
          }}
        />
        <div className="py-[.15rem] rounded-lg px-5 bg-blue-500 text-white text-sm font-semibold z-10">
          <p>{relevantInfo.status}</p>
        </div>
        <div className="py-[.15rem] rounded-lg px-5 bg-black sm:bg-opacity-10 bg-opacity-30 text-slate-50 text-lg font-semibold z-10">
          <p>
            {relevantInfo.tokenValue
              ? `${parseFloat(relevantInfo.tokenValue).toLocaleString(
                  'es-CO'
                )} ${relevantInfo.tokenCurrency} / tCO2eq`
              : 'No price'}
          </p>
        </div>
      </div>
      <div className="sm:h-[60%] w-full flex flex-col items-center bg-white  rounded-b-2xl">
        <div className="flex pt-5 pb-2 w-11/12">
          <div className="px-5 py-2 rounded-[.2rem] mr-2 text-xs text-[#1E446E] bg-[#D6F8F4]">
            {relevantInfo.category}
          </div>
          <div className="px-5 py-2 rounded-[.2rem] mr-2 text-xs text-[#1E446E] bg-[#D6F8F4]">
            {relevantInfo.dateOfInscription}
          </div>
        </div>
        <div className="pt-2 pb-3 text-grey-800 font-semibold w-11/12 border-b-2 border-grey-300">
          <h3 className="text-lg truncate">{relevantInfo.name}</h3>
        </div>
        <p className="w-11/12 pt-3 text-xs pr-5 text-gray-600 leading-4 max-h-20 overflow-hidden overflow-y-hidden hidden lg:inline-block md:hidden sm:hidden">
          {project.description}
        </p>
        <div className="absolute bottom-8 w-11/12 flex justify-between text-xs items-center">
          <div className="flex">
            <div className="flex items-center ml-3">
              <svg
                className="w-4 h-4 text-gray-400 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0a10 10 0 1 0 10 10A10.009 10.009 0 0 0 10 0Zm6.613 4.614a8.523 8.523 0 0 1 1.93 5.32 20.094 20.094 0 0 0-5.949-.274c-.059-.149-.122-.292-.184-.441a23.879 23.879 0 0 0-.566-1.239 11.41 11.41 0 0 0 4.769-3.366ZM8 1.707a8.821 8.821 0 0 1 2-.238 8.5 8.5 0 0 1 5.664 2.152 9.608 9.608 0 0 1-4.476 3.087A45.758 45.758 0 0 0 8 1.707ZM1.642 8.262a8.57 8.57 0 0 1 4.73-5.981A53.998 53.998 0 0 1 9.54 7.222a32.078 32.078 0 0 1-7.9 1.04h.002Zm2.01 7.46a8.51 8.51 0 0 1-2.2-5.707v-.262a31.64 31.64 0 0 0 8.777-1.219c.243.477.477.964.692 1.449-.114.032-.227.067-.336.1a13.569 13.569 0 0 0-6.942 5.636l.009.003ZM10 18.556a8.508 8.508 0 0 1-5.243-1.8 11.717 11.717 0 0 1 6.7-5.332.509.509 0 0 1 .055-.02 35.65 35.65 0 0 1 1.819 6.476 8.476 8.476 0 0 1-3.331.676Zm4.772-1.462A37.232 37.232 0 0 0 13.113 11a12.513 12.513 0 0 1 5.321.364 8.56 8.56 0 0 1-3.66 5.73h-.002Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="ml-2 text-[#8EB9C7]">
              {relevantInfo.tokenUnits
                ? `${relevantInfo.tokenUnits.toLocaleString('es-CO')} `
                : '0 '}
              <span className="hidden sm:hidden md:hidden lg:inline-block">
                Tokens disponibles
              </span>
            </p>
          </div>
          <Link
            className="px-9 py-2 rounded-[.2rem] bg-[#69A1B3] text-white hover:bg-[#436d7b]"
            href={`/projects/${project.id}`}
          >
            Ver Más
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CardProject;
