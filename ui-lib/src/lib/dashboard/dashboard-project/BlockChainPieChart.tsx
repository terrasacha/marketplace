import React, { useEffect, useState } from 'react';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from "../../common/Card";

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
  const backgrounds = [
    'rgb(255, 99, 132)',
    'rgb(75, 192, 192)',
    'rgb(53, 162, 235)',
    'rgb(255, 205, 86)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
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
        labels: {
          color: '#DDD',
        },
      },
    },
  };

  return (
    <Card className="h-full !bg-custom-dark-hover text-white">
      <Card.Header title={`Distribución de tokens`} />
      <Card.Body>
        <Pie data={data} options={options} />
      </Card.Body>
    </Card>
  );
}
