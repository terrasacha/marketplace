import React, { useEffect, useState } from 'react';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '../../ui-lib';
interface BlockChainPieChartProps {
  project: any;
}

interface ChartDataItem {
  name: string;
  value: number;
}

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

export default function BlockChainPieChart({
  project,
}: BlockChainPieChartProps) {
  const [newChartData, setChartData] = useState<ChartDataItem[]>([]);
  const [newData, setNewData] = useState<any>(null); // Nueva variable de estado
  const [globalTokenAmount, setGlobalTokenAmount] = useState<any>(null);
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
    let dataFormatted = data.map((item: any) => {
      return {
        name: item.CONCEPTO,
        value: item.CANTIDAD,
      };
    });
    return dataFormatted;
  }

  const data = {
    labels: newChartData.map((item: any) => item.name),
    datasets: [
      {
        label: 'Tokens repartidos',
        data: newChartData.map((item: any) => item.value),
        backgroundColor: [
          'rgba(217, 119, 6, 0.9)',
          'rgba(251, 191, 36, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(180, 83 ,9, 0.9)',
          'rgba(146, 64 ,14, 0.9)',
          'rgba(255, 251, 235, 0.9)',
          'rgba(254, 243, 199, 0.9)',
          'rgba(253, 230, 138, 0.9)',
          'rgba(252, 211, 77, 0.9)',
        ],
        borderColor: [
          'rgba(217, 119, 6, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(180, 83 ,9, 1)',
          'rgba(146, 64 ,14, 1)',
          'rgba(255, 251, 235, 1)',
          'rgba(254, 243, 199, 1)',
          'rgba(253, 230, 138, 1)',
          'rgba(252, 211, 77, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#DDD',
        },
      },
    },
  };

  return (
    <Card className="h-fit !bg-custom-dark-hover text-white">
      <Card.Header title={`Distribución de tokens`} />
      <Card.Body>
        <Pie data={data} options={options} />
      </Card.Body>
    </Card>
  );
}
