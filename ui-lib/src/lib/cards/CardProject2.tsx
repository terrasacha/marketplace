import { useEffect, useState } from 'react';
import { Card } from '../ui-lib';
import Image from 'next/image';
import { getActualPeriod } from '@marketplaces/utils-2';
import Link from 'next/link';

interface CardProject {
  projectId: string;
  tags: Array<string>;
  title: string;
  description: string;
  availableTokens: string;
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

export default function CardProject(props: any) {
  const { project } = props;

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
    <Card className="relative">
      <header className="h-52">
        <div className="relative flex w-full h-full">
          <Image
            priority={false}
            src={`https://kiosuanbcrjsappcad3eb2dd1b14457b491c910d5aa45dd145518-dev.s3.amazonaws.com/public/category-projects-images/${encodeURIComponent(
              `${project.categoryID}`
            )}.avif`}
            className="rounded-t-lg"
            alt="landing-suan-image"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center bottom',
              zIndex: '0',
            }}
          />
          <div className="absolute p-6 flex w-full justify-between">
            <span className="bg-custom-dark text-custom-fondo text-sm font-medium px-2.5 py-0.5 rounded  border border-custom-fondo">
              {relevantInfo.status}
            </span>
            <span className="bg-amber-400 text-sm font-medium px-2.5 py-0.5 rounded border border-custom-dark">
              {relevantInfo.tokenValue
                ? `${parseFloat(relevantInfo.tokenValue).toLocaleString(
                    'es-CO'
                  )} ${relevantInfo.tokenCurrency} / tCO2eq`
                : 'No price'}
            </span>
          </div>
        </div>
      </header>
      <Card.Body>
        <div className="space-y-2">
          {/* Orden */}
          <div className="flex">
            <p className="font-semibold text-xl">{relevantInfo.name}</p>
          </div>
          {/* Orden */}
          <div className="flex space-x-2">
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded  border border-gray-500">
              {relevantInfo.category}
            </span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border border-gray-500">
              <svg
                className="w-2.5 h-2.5 me-1.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z" />
              </svg>
              {relevantInfo.dateOfInscription}
            </span>
          </div>
          <div className="flex h-50">
            <p className="text-xs line-clamp-4 ">{project.description}</p>
          </div>
          <div className="flex justify-center bg-amber-400 text-xs px-2.5 py-0.5 rounded border border-custom-dark">
            <p>
              Tokens disponibles para comprar:{' '}
              <span className="font-semibold">
                {relevantInfo.tokenUnits
                  ? `${relevantInfo.tokenUnits.toLocaleString('es-CO')} `
                  : '0'}
              </span>
            </p>
          </div>
          <Link
            className="flex justify-center w-full text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
            href={`/projects/${project.id}`}
          >
            Ver Más
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
