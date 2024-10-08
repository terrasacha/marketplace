import { useEffect, useState } from 'react';
import Card from '../common/Card';
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
const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
  Terrasacha: {
    bgColor: 'bg-custom-marca-boton',
    hoverBgColor: 'hover:bg-custom-marca-boton-variante',
    bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
    fuente:'font-jostBold',
    fuenteAlterna:'font-jostRegular',
  },

  // Agrega más marketplaces y colores aquí
};
const colors = marketplaceColors[marketplaceName] || {
  bgColor:  'bg-custom-dark' ,
  hoverBgColor: 'hover:bg-custom-dark-hover',
  bgColorAlternativo: 'bg-amber-400',
  fuente:'font-semibold',
  fuenteAlterna:'font-medium',
};

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

  const [availableTokenAmount, setAvailableTokenAmount] = useState<
    number | null
  >(null);

  useEffect(() => {
    const getAvailableTokens = async (
      spendContractAddress: string,
      tokenName: string,
      tokenContractId: string
    ) => {
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(spendContractAddress),
        }
      );
      const spentWalletData = await response.json();

      if (!spentWalletData) {
        console.log('Parece que un error ha ocurrido ...');
      }

      const investorProjectTokensAmount = spentWalletData.assets.reduce(
        (sum: number, item: any) => {
          if (
            item.asset_name === tokenName &&
            item.policy_id === tokenContractId
          ) {
            return sum + parseInt(item.quantity);
          }
        },
        0
      );
      setAvailableTokenAmount(investorProjectTokensAmount);
      return investorProjectTokensAmount;
    };

    // Obtener del endpoint de luis la cantidad de tokens disponibles para comprar
    const mintProjectTokenContract = project.scripts.items.find(
      (script: any) => script.script_type === 'mintProjectToken' && script.Active === true
    );

    const spendContractFromMintProjectToken = project.scripts.items.find(
      (script: any) => script.script_type === 'spendProject' && script.Active === true
    );

    if (mintProjectTokenContract && spendContractFromMintProjectToken) {
      getAvailableTokens(
        spendContractFromMintProjectToken.testnetAddr,
        mintProjectTokenContract.token_name,
        mintProjectTokenContract.id
      );
    }
  }, []);

  // const getInvestorTokensDistributed = (projectData: any) => {
  //   const productFeatures = projectData.productFeatures.items;
  //   if (productFeatures) {
  //     const tokenAmountDistribution = JSON.parse(
  //       productFeatures.filter((item: any) => {
  //         return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION';
  //       })[0]?.value || '{}'
  //     );

  //     const ownerAmountOfTokens = parseInt(
  //       tokenAmountDistribution.find(
  //         (stakeHolderDis: any) =>
  //           stakeHolderDis.CONCEPTO.toLowerCase() === 'inversionista'
  //       )?.CANTIDAD
  //     );

  //     return ownerAmountOfTokens;
  //   } else {
  //     return false;
  //   }
  // };

  // const investorTokenDistribution = getInvestorTokensDistributed(project);

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
  const actualPeriod: any = getActualPeriod(Date.now(), periods);
  // const totalProjectTokens = periods.reduce(
  //   (sum: number, item: any) => sum + parseInt(item.amount),
  //   0
  // );
  // const totalTokensSold = project.transactions.items.reduce(
  //   (acc: any, item: any) => {
  //     return acc + item.amountOfTokens;
  //   },
  //   0
  // );

  // const totalTokensFromFirstToActualPeriod: number = tokenHistoricalData.reduce(
  //   (acc: any, hd: any) => {
  //     if (parseInt(hd.period) <= parseInt(actualPeriod.period)) {
  //       return acc + hd.amount;
  //     } else {
  //       return acc;
  //     }
  //   },
  //   0
  // );

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
    tokenUnits: availableTokenAmount,
    tokenValue: actualPeriod?.price,
    tokenCurrency: tokenCurrency,
  };

  return (
    <Card className="relative">
      <header className="h-52">
        <div className="relative flex w-full h-full">
          <Image
            priority={false}
            src={`${process.env['NEXT_PUBLIC_s3EndPoint']}public/category-projects-images/${encodeURIComponent(
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
            <span className={`${colors.fuenteAlterna} ${colors.bgColor} text-custom-fondo text-sm  px-2.5 py-0.5 rounded  border border-custom-fondo`}>
              {relevantInfo.status}
            </span>
            <span className={`${colors.bgColorAlternativo} bg-amber-400  text-custom-fondo text-sm  px-2.5 py-0.5 rounded border border-custom-fondo`}>
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
            <p className={`${colors.fuente} text-xl`}>{relevantInfo.name}</p>
          </div>
          {/* Orden */}
          <div className="flex space-x-2">
            <span className={` text-gray-800 text-xs ${colors.fuenteAlterna}  px-2.5 py-0.5 rounded  border border-gray-500`}>
              {relevantInfo.category}
            </span>
            <span className={` text-gray-800 text-xs ${colors.fuenteAlterna} px-2.5 py-0.5 rounded border border-gray-500`}>
              {relevantInfo.dateOfInscription}
            </span>
          </div>
          <div className="flex h-50">
            <p className={`${colors.fuenteAlterna} text-xs line-clamp-4 `}>{project.description}</p>
          </div>
          <div className={`bg-amber-400 ${colors.fuente} flex justify-center ${colors.bgColorAlternativo} text-xs px-2.5 py-0.5 rounded border border-custom-dark`}>
            <p>
              Tokens disponibles para comprar:{' '}
              <span className={`colors.fuente}`}>
                {relevantInfo.tokenUnits
                  ? `${relevantInfo.tokenUnits.toLocaleString('es-CO')} `
                  : '...'}
              </span>
            </p>
          </div>
          <Link
            className=
            {`flex justify-center w-full text-white ${colors.bgColor} ${colors.hoverBgColor}  focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 `}
            href={`/projects/${project.id}`}
          >
            Ver Más de {project.name} 
            
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
