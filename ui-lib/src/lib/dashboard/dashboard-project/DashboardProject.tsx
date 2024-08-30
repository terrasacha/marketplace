import { useEffect, useState, useContext } from 'react';
import LineChartComponent from '../../graphs/LineChartComponent';
import DefaultCard from './DefaultCard';
import DefaultCardClient from './DefaultCardClient';
import TokenCard from './TokenCard';
/* import { useWallet } from '@meshsdk/react'; */
import { WalletContext } from '@marketplaces/utils-2';
import { mapDashboardProject } from '@marketplaces/utils-2';
import ActualUseAndPotentialInfoCard from './ActualUseAndPotentialInfoCard';
import BlockChainPieChart from './BlockChainPieChart';
import StackBarGraphComponent from '../../graphs/StackBarGraphComponent';
import { useRouter } from 'next/router';
import DashboardProjectSkeleton from '../../common/skeleton/DashboardProjectSkeleton';
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

export default function DashboardProject(props: any) {
  const router = useRouter();
  const { walletData } = useContext<any>(WalletContext);
  const { project, projectData, projectId } = props;
  /* const { wallet, connected } = useWallet(); */
  const [dashboardProjectData, setDashboardProjectData] = useState<any>(null);

  useEffect(() => {
    if (walletData) {
      mapDashboardProject(project, projectData, projectId, walletData).then(
        (data: any) => {
          console.log(data, 'setDashboardProjectData');
          setDashboardProjectData(data);
        }
      );
    }
  }, [walletData]);
  if(!dashboardProjectData) return <DashboardProjectSkeleton />
  return (
      <div className="bg-[#F4F8F9] h-auto w-full px-5 pt-6">
      <div className="flex justify-between">
        <button
          onClick={() => router.back()}
          className={` ${colors.fuenteAlterna}  flex items-center text-[#287993] text-sm`}
        >
          <svg
            className={` w-3 h-3 mr-2 text-[#287993]  dark:text-white`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 8 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
            />
          </svg>
          Regresar
        </button>
      </div>
      <h2 className={`p-4 text-2xl lg:text-3xl ${colors.fuente}  text-gray-900 dark:text-gray-500`}>
        {project.name}
      </h2>

      <div className={`grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3 ${colors.fuenteAlterna} `}>
        <div className={`row-span-2 lg:col-span-1 2xl:col-span-1 lg:row-span-2 ${colors.fuenteAlterna} `}>
          <TokenCard
            projectName={project.name}
            categoryName={projectData.projectInfo.category}
          />
        </div>
        {[
          {
            title: 'Total tokens vendidos',
            value: dashboardProjectData.tokensSold
              ? `${dashboardProjectData.tokensSold.toLocaleString(
                  'es-CO'
                )} `
              : '0',
            percentage: dashboardProjectData.relevantInfo.tokenPercentageSold,
            tooltipText: 'Cantidad de tokens vendidos del proyecto a inversionistas'
          },
          {
            title: 'Tokens propios',
            value: dashboardProjectData.totalTokens || 0,
            percentage:
              dashboardProjectData.relevantInfo.tokenPercentageTokensOwn,
            tooltipText: 'Cantidad de tokens del proyecto en su billetera. Porcentaje respecto a la cantidad de tokens distribuidos para inversionistas.'

          },
          {
            title: 'Valor total del token en tu portfolio',
            value: `${dashboardProjectData.totalValueRate} USD `,
            image: 'naturaleza',
            rates: dashboardProjectData.rates,
            tooltipText: 'Valor total de los tokens del proyecto en su billetera'

          },

          {
            title: 'Progreso proyecto',
            percentage: dashboardProjectData.progressproject,
            tooltipText: 'Progreso del proyecto respecto a los periodos transcurridos'
          },
          {
            title: 'Crecimiento precio del token',
            value: `${dashboardProjectData.tokenDeltaPrice} USD`,
            percentage: dashboardProjectData.actualProfitPercentage,
            tooltipText: 'Aumento del valor unitario del token respecto al primer pediodo'
          },
          {
            title: 'Precio actual del token',
            value: `${dashboardProjectData.actualTokenPriceUSD} USD`,
            image: 'money_managment',
            tooltipText: 'Precio del token en el periodo actual'
          },
        ].map((info, index) => (
          <div key={index} className="lg:col-span-1">
              <DefaultCard
                title={info.title}
                value={info.value}
                //@ts-ignore
                subtitle={info.subtitle}
                image={info.image}
                percentage={info.percentage}
                tooltipText={info.tooltipText}
              />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3 mt-4">
        <div className="bg-custom-dark-hover p-4 rounded-md shadow-lg col-span-2 row-span-6 lg:col-span-2 2xl:col-span-3 lg:row-span-6 flex flex-col ">
          <h2 className={`text-xl ${colors.fuente}  text-white`}>
            Evolución del precio del token
          </h2>

          {dashboardProjectData.lineChartData && 
          <LineChartComponent
            lineChartData={dashboardProjectData.lineChartData}
            plotVolume={true}
          />}
        </div>
        {[
          {
            title: dashboardProjectData.relevantInfo.municipio,
            value: dashboardProjectData.relevantInfo.vereda,
            image: 'tierra',
            tooltipText:'Localización del predio'
          },
          {
            title: 'Total de tokens del proyecto',
            subtitle: 'Toneladas disponibles',
            value: dashboardProjectData.totalAmountOfTokens,
            image: 'tokens',
            tooltipText:'Cantidad total de tokens asociados al proyecto'
          },
          {
            title: 'Total de Tokens para inversionistas',
            subtitle: 'Toneladas disponibles',
            value: dashboardProjectData.tokensToInversionists,
            image: 'tokens',
            tooltipText:'Cantidad total de tokens disponibles para ser adquiridos por inversionistas'
          },
          {
            title: 'Periodo actual',
            value: projectData.projectInfo.token.actualPeriod,
            image: 'reloj_de_arena',
            tooltipText:'Periodo actual del proyecto'
          },

          {
            title: 'Áreas terreno',
            value: `${projectData.projectInfo.area} ha`,
            image: 'siembra',
            tooltipText:'Área total del predio expresado en hectáreas'
          },
          {
            title: 'Duración proyecto',
            value: dashboardProjectData.projectDuration,
            image: 'calendar',
            tooltipText:'Duración total de la comercialización del proyecto'
          },
        ].map((info, index) => (
          <div key={index} className=" lg:grid-cols-1">
            <DefaultCard
              title={info.title}
              value={info.value}
              subtitle={info.subtitle}
              image={info.image}
              tooltipText={info.tooltipText}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-9 2xl:grid-cols-9 2xl:grid-rows-2 lg:grid-rows-2 gap-6 mt-4">
        <div className="lg:col-span-6 lg:row-span-2">
          {dashboardProjectData.stackData && (
            <StackBarGraphComponent
              stackData={dashboardProjectData.stackData}
            />
          )}
        </div>
        <div className="lg:col-span-3 lg:row-span-2">
          <BlockChainPieChart project={project} />
        </div>
      </div>
      </div>
  )
}
