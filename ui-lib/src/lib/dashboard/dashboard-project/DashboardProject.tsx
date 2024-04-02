import { useEffect, useState, useContext } from 'react';
import { LineChartComponent } from '../../ui-lib';
import DefaultCard from './DefaultCard';
import DefaultCardClient from './DefaultCardClient';
import TokenCard from './TokenCard';
/* import { useWallet } from '@meshsdk/react'; */
import { WalletContext } from '@marketplaces/utils-2';
import { mapDashboardProject } from '@marketplaces/utils-2';
import ActualUseAndPotentialInfoCard from './ActualUseAndPotentialInfoCard';
import BlockChainPieChart from './BlockChainPieChart';
import { StackBarGraphComponent } from '../../ui-lib';
export default function DashboardProject(props: any) {
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

  if (!dashboardProjectData) return <></>;
  return (
    <div className="bg-[#F4F8F9] h-auto w-full px-5 pt-6">
      <h2 className="p-4 text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-500">
        {project.name}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3">
        <div className="row-span-2 lg:col-span-1 2xl:col-span-1 lg:row-span-2">
          <TokenCard
            projectName={project.name}
            categoryName={projectData.projectInfo.category}
          />
        </div>
        {[
          {
            title: 'Total tokens vendidos',
            value: dashboardProjectData.totalTokensSold
              ? `${dashboardProjectData.totalTokensSold.toLocaleString(
                  'es-CO'
                )} `
              : '0',
            percentage: dashboardProjectData.relevantInfo.tokenPercentageSold,
          },
          {
            title: 'Tokens propios',
            value: dashboardProjectData.totalTokens || 0,
            percentage:
              dashboardProjectData.relevantInfo.tokenPercentageTokensOwn,
          },
          {
            title: 'Valor total en portfolio',
            value: dashboardProjectData.asset,
            image: 'naturaleza',
            rates: dashboardProjectData.rates,
            extra: 'client',
          },

          {
            title: 'Progreso proyecto',
            percentage: dashboardProjectData.progressproject,
          },
          {
            title: 'Crecimiento precio del token',
            value: `${dashboardProjectData.tokenDeltaPrice} USD`,
            percentage: dashboardProjectData.actualProfitPercentage,
          },
          {
            title: 'Precio actual del token',
            value: `${dashboardProjectData.actualTokenPriceUSD} USD`,
            image: 'money_managment',
          },
        ].map((info, index) => (
          <div key={index} className="lg:col-span-1">
            {!info.extra ? (
              <DefaultCard
                title={info.title}
                value={info.value}
                //@ts-ignore
                subtitle={info.subtitle}
                image={info.image}
                percentage={info.percentage}
              />
            ) : (
              <DefaultCardClient
                title={info.title}
                value={info.value}
                rates={info.rates}
                //@ts-ignore
                subtitle={info.subtitle}
                image={info.image}
                percentage={info.percentage}
              />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3 mt-4">
        <div className="bg-custom-dark-hover p-4 rounded-md shadow-lg col-span-2 row-span-6 lg:col-span-2 2xl:col-span-3 lg:row-span-6 flex flex-col ">
          <h2 className="text-xl font-semibold text-white">
            Evolución del precio
          </h2>

          <LineChartComponent
            lineChartData={dashboardProjectData.lineChartData}
            plotVolume={true}
          />
        </div>
        {[
          {
            title: dashboardProjectData.relevantInfo.municipio,
            value: dashboardProjectData.relevantInfo.vereda,
            image: 'tierra',
          },
          {
            title: 'Total de Tokens del proyecto',
            subtitle: 'Toneladas disponibles',
            value: dashboardProjectData.totalAmountOfTokens,
            image: 'tokens',
          },
          {
            title: 'Total de Tokens para inversionistas',
            subtitle: 'Toneladas disponibles',
            value: dashboardProjectData.tokensToInversionists,
            image: 'tokens',
          },
          {
            title: 'Periodo actual',
            value: projectData.projectInfo.token.actualPeriod,
            image: 'reloj_de_arena',
          },

          {
            title: 'Areas terreno',
            value: `${projectData.projectInfo.area} ha`,
            image: 'siembra',
          },
          {
            title: 'Duración proyecto',
            value: dashboardProjectData.projectDuration,
            image: 'calendar',
          },
        ].map((info, index) => (
          <div key={index} className=" lg:grid-cols-1">
            <DefaultCard
              title={info.title}
              value={info.value}
              subtitle={info.subtitle}
              image={info.image}
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
      <div className="mt-4">
        <ActualUseAndPotentialInfoCard
          actualUse={projectData.projectUses.actualUse}
          replaceUse={projectData.projectUses.replaceUse}
        />
      </div>
    </div>
  );
}
