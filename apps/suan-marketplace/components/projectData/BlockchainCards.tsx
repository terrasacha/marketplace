import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BlockchainCardProps {
  project: any;
}

/* interface ChartDataItem {
  name: string;
  value: number;
} */

interface Traducciones {
  [key: string]: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="label">{`${data.name}: ${data.value}`}</p>
      </div>
    );
  }
  return null;
};

export default function BlockchainCard({ project }: BlockchainCardProps) {
  const [newChartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [totalOwnerValue, setTotalOwnerValue] = useState(1);
  const [newData, setNewData] = useState<any>(null); // Nueva variable de estado
  const traducciones: Traducciones = {
    buffer: 'Buffer',
    comunity: 'Comunidad',
    investor: 'Inversionista',
    owner: 'Propietario',
    suan: 'Suan',
  };

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#AF19FF',
    '#FF1942',
    '#00FF99',
    '#FF6600',
    '#8A2BE2',
  ];

  useEffect(() => {
    const globalTokenTotalAmount = getGlobalTokenTotalAmount(project);
    const newData = getNewChartData(project);
    setNewData(newData);

    if (newData) {
      const chartData = transformDataForChart(newData, globalTokenTotalAmount);
      setChartData(chartData);
      const distributionData = project.productFeatures.items.find((item : any)=> item.featureID === "GLOBAL_TOKEN_AMOUNT_DISTRIBUTION") || []
      const infoTable = JSON.parse((distributionData.value))
      const totalOwnerValue = infoTable.reduce(
        (sum : number, item : any) => sum + parseInt(item.CANTIDAD),
        0
      );
      setTableData(infoTable)
      setTotalOwnerValue(totalOwnerValue)
    }
  }, []);

  function getGlobalTokenTotalAmount(project: any): number {
    const totalTokensPF = JSON.parse(
      project.productFeatures.items.find(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
      )?.value || '[]'
    );

    const totalTokens = totalTokensPF.reduce(
      (sum: number, item: any) => sum + parseInt(item.amount),
      0
    );

    return totalTokens;
  }

  function getNewChartData(project: any): any {
    let chartData: any = {};
    console.log('productFeatures', project.productFeatures);

    const tokenAmountDistribution = JSON.parse(
      project.productFeatures.items.filter(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
      )[0]?.value || '[]'
    );

    console.log('tokenAmountDistribution', tokenAmountDistribution);

    tokenAmountDistribution.forEach((tad: any) => {
      chartData[tad.CONCEPTO] = tad.CANTIDAD;
    });

    return chartData;
  }

  function transformDataForChart(
    data: any,
    totalAmount: number
  ): any {
    return Object.keys(data).map((key) => ({
      name: traducciones[key] || key,
      value: Number(((Number(data[key]) / totalAmount) * 100).toFixed(1)),
    }));
  }

  return (
    <div className="items-center justify-center flex sm:flex-col gap-y-4 flex-col w-full">
      <p>
        Esta sera la distribución de los{' '}
        <strong>{getGlobalTokenTotalAmount(project)}</strong> tokens destinados
        a este proyecto
      </p>
      <table className="w-11/12 text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
              <tr className="distribution">
                {tableData.map((item : any, index) => (
                  <th scope="col" className="px-3 py-2" key={index}>
                    {item.CONCEPTO}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 distribution">
                {tableData.map((item : any, index) => (
                  <td className="px-3 py-2" key={index}>
                    {(
                      (parseInt(item.CANTIDAD) / totalOwnerValue) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
      <div className=' w-full flex justify-center'>
        <ResponsiveContainer width="50%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={newChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              fill="#8884d8"
              labelLine={false}
            >
              {newChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" align="left" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
