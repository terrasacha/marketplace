import { useEffect, useState, useContext } from 'react';
import { LineChartComponent } from '../../ui-lib';
import { getActualPeriod } from '@marketplaces/utils-2';
import DefaultCard from './DefaultCard';
import TokenCard from './TokenCard';
import { useWallet } from '@meshsdk/react';
import { WalletContext } from '@marketplaces/utils-2';
import { mapDashboardProject } from '@marketplaces/utils-2';
import ActualUseAndPotentialInfoCard from './ActualUseAndPotentialInfoCard';
import BlockChainPieChart from './BlockChainPieChart';
export default function DashboardProject(props: any) {
  const { walletData } = useContext<any>(WalletContext);
  console.log(walletData, 'walletData Dashboard');
  const { project, projectData, transactions, projectId } = props;
  const { wallet, connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<string | undefined>(
    undefined
  );
  const [dashboardProjectData, setDashboardProjectData] = useState<any>(null);

  useEffect(() => {
    if (walletStakeID) {
      mapDashboardProject(
        transactions,
        project,
        projectData,
        projectId,
        walletStakeID
      ).then((data) => {
        console.log(data);
        setDashboardProjectData(data);
      });
    }
  }, [walletStakeID]);
  useEffect(() => {
    async function loadWalletStakeID() {
      try {
        if (connected) {
          const addresses = await wallet.getRewardAddresses();
          if (addresses.length > 0) {
            const firstAddress = addresses[0];
            setWalletStakeID(firstAddress);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadWalletStakeID();
  }, [connected, wallet]);

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
          },
          {
            title: 'Capital invertido',
            value: `${dashboardProjectData.totalInvestmentCOP} COP`,
            image: 'naturaleza',
          },

          {
            title: 'Progreso proyecto',
            percentage: `${
              (projectData.projectInfo.token.actualPeriod /
                projectData.projectInfo.token.historicalData.length) *
              100
            }`,
          },
          {
            title: 'Ganancias',
            value: `${dashboardProjectData.totalGananciaCOP} COP`,
            percentage: `${
              (dashboardProjectData.totalGananciaCOP * 100) /
              dashboardProjectData.totalInvestmentCOP
            }`,
          },
          {
            title: 'Precio actual del token',
            value: projectData.projectInfo.token.actualPeriodTokenPrice,
            image: 'money_managment',
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
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3 mt-4">
        <div className="bg-custom-dark-hover p-4 rounded-md shadow-lg col-span-2 row-span-4 lg:col-span-2 2xl:col-span-3 lg:row-span-5 flex flex-col ">
          <h2 className="text-xl font-semibold text-white">
            Evolución del precio
          </h2>

          <LineChartComponent
            lineChartData={dashboardProjectData.lineChartData}
            plotVolume={true}
          />
        </div>
        {[
          { title: 'Colombia', image: 'tierra' },
          {
            title: 'Tokens disponibles',
            subtitle: 'Toneladas disponibles',
            value: projectData.projectInfo.token.actualPeriodTokenAmount,
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
      <div className="grid grid-cols-1 lg:grid-cols-9 2xl:grid-cols-9 gap-6 mt-4">
        <div className="lg:col-span-6">
          <ActualUseAndPotentialInfoCard
            actualUse={projectData.projectUses.actualUse}
            replaceUse={projectData.projectUses.replaceUse}
          />
        </div>

        <div className="lg:col-span-3">
          <BlockChainPieChart project={project} />
        </div>
      </div>
    </div>
  );
}
