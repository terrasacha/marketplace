import { useEffect, useState } from 'react';
import { CopyToClipboard } from '../../ui-lib';
import { Pie } from 'react-chartjs-2';

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number; // Nuevo campo para el porcentaje
}

interface Traducciones {
  [key: string]: string;
}

export default function ProjectItem(props: any) {
  const { project } = props;
  const [newChartData, setChartData] = useState<ChartDataItem[]>([]);
  const [globalTokenAmount, setGlobalTokenAmount] = useState<number>(0);
  const [mintProjectToken, setMintProjectToken] = useState<any>(null);
  const [spendSwap, setSpendSwap] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  useEffect(() => {
    if (project) {
      const spendFromProject = project.scripts.items.find(
        (script: any) => script.script_type === 'spendProject'
      );

      const mintProjectTokenFromProject = project.scripts.items.find(
        (script: any) => script.script_type === 'mintProjectToken'
      );

      setSpendSwap(spendFromProject);
      setMintProjectToken(mintProjectTokenFromProject);
      setTokenData(project.tokens.items[0]);
    }
  }, [project]);

  const getTokenAmountDistribution = (productFeatures: any) => {
    const tokenAmountDistribution = JSON.parse(
      productFeatures.items.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION';
      })[0]?.value || '{}'
    );

    return tokenAmountDistribution;
  };

  const traducciones: Traducciones = {
    buffer: 'Buffer',
    comunity: 'Comunidad',
    investor: 'Inversionista',
    owner: 'Propietario',
    suan: 'Suan',
  };

  useEffect(() => {
    const globalTokenTotalAmount = getGlobalTokenTotalAmount(project);
    const newData = getNewChartData(project);
    setGlobalTokenAmount(globalTokenTotalAmount);

    if (newData) {
      const chartData = transformDataForChart(newData, globalTokenTotalAmount);
      setChartData(chartData);
    }
  }, []);

  function getGlobalTokenTotalAmount(project: any): number {
    const GLOBAL_TOKEN_TOTAL_AMOUNT = 'GLOBAL_TOKEN_TOTAL_AMOUNT';
    const featureItem = project.productFeatures.items.find(
      (item: any) => item.featureID === GLOBAL_TOKEN_TOTAL_AMOUNT
    );
    return featureItem ? Number(featureItem.value) : 0;
  }

  function getNewChartData(project: any): any {
    return JSON.parse(
      project.productFeatures.items.filter(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
      )[0]?.value || '[]'
    );
  }

  function transformDataForChart(
    data: any,
    totalAmount: number
  ): ChartDataItem[] {
    const dataFormatted = data.map((item: any) => {
      const percentage = (item.CANTIDAD / totalAmount) * 100;
      return {
        name: item.CONCEPTO,
        value: item.CANTIDAD,
        percentage: percentage,
      };
    });
    return dataFormatted;
  }

  const data = {
    labels: newChartData.map((item: ChartDataItem) => item.name),
    datasets: [
      {
        label: 'Tokens repartidos',
        data: newChartData.map((item: ChartDataItem) => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.9)',
          'rgba(75, 192, 192, 0.9)',
          'rgba(53, 162, 235, 0.9)',
          'rgba(255, 205, 86, 0.9)',
          'rgba(255, 159, 64, 0.9)',
          'rgba(153, 102, 255, 0.9)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(53, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            if (context.datasetIndex === 0 && context.dataIndex !== undefined) {
              const dataset = data.datasets[context.datasetIndex];
              const value = dataset.data[context.dataIndex];
              const total = globalTokenAmount;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div
      className="col-span-2 lg:col-span-1 w-full rounded-lg bg-custom-dark p-3"
      key={project.id}
    >
      <div className="flex p-3 gap-3 items-center">
        <div className="flex-none">
          <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-white rounded-lg">
            <span className="font-medium text-custom-dark">PY</span>
          </div>
        </div>
        <div className="flex-1 text-white">
          <p className="text-xl text-amber-400">{project.name}</p>
          <div className="flex gap-2">
            <p className="flex-1 text-sm truncate w-36">
              {project.category.name}
            </p>
          </div>
        </div>
        <div className="flex-none text-white">
          <button
            type="button"
            className="text-custom-dark bg-white hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
            onClick={() => {
              getTokenAmountDistribution(project.productFeatures);
            }}
          >
            Distribuir Tokens
          </button>
        </div>
      </div>

      <div className="flex p-3 border-b border-t gap-3">
        <div className="flex-1 text-white space-y-2">
          <p className="mb-2 text-amber-400">Token</p>
          <div className="flex mb-0 pb-0">
            <p className="flex-1 text-xs truncate w-36 py-1">
              POLICY ID: <span>{tokenData?.id}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={tokenData?.id}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
          <p className="flex-1 text-xs py-1">
            NOMBRE: <span>{tokenData?.tokenName}</span>
          </p>
          <p className="flex-1 text-xs py-1">
            CANTIDAD: <span>{tokenData?.supply}</span>
          </p>
          <p className="flex-1 text-xs py-1">
            PRECIO:{' '}
            <span>
              ₳ {(tokenData?.oraclePrice / 1000000).toLocaleString('es-CO')}
            </span>
          </p>
        </div>
        <div className="flex-1 text-white">
          <p className="mb-2 text-amber-400">Distribución StakeHolders</p>
          <div className="flex justify-center items-center h-40 w-40">
            <Pie data={data} options={options} />
          </div>
        </div>
      </div>
      <div className="flex items-center p-3 border-b gap-3">
        <div className="flex-1 text-white">
          <p className="mb-2 text-amber-400">Contrato de distribución</p>
          <div className="flex gap-2">
            <p className="flex-1 text-xs truncate w-36">
              POLICY ID: <span>{mintProjectToken?.id}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={mintProjectToken?.id}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <p className="flex-1 text-xs truncate w-36">
              PBK: <span>{mintProjectToken?.pbk}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={mintProjectToken?.pbk}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <p className="flex-1 text-xs truncate w-36">
              ADDRESS: <span>{mintProjectToken?.testnetAddr}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={mintProjectToken?.testnetAddr}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 text-white">
          <p className="mb-2 text-amber-400">Contrato de intercambio</p>
          <div className="flex gap-2">
            <p className="flex-1 text-xs truncate w-36">
              POLICY ID: <span>{spendSwap?.id}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={spendSwap?.id}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <p className="flex-1 text-xs truncate w-36">
              PBK: <span>{spendSwap?.pbk}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={spendSwap?.pbk}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <p className="flex-1 text-xs truncate w-36">
              ADDRESS: <span>{spendSwap?.testnetAddr}</span>
            </p>
            <div className="flex-none">
              <CopyToClipboard
                iconClassName="h-4 w-4"
                copyValue={spendSwap?.testnetAddr}
                tooltipLabel="Copiar !"
              />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex items-center p-3 border-b">
        <Pie data={data} options={options} height={50} width={50} />
      </div> */}
    </div>
  );
}
