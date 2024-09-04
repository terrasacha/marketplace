import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from "../../common/Card";
ChartJS.register(ArcElement, Tooltip, Legend);

interface BlockChainPieChartProps {
  project: any;
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number; // Nuevo campo para el porcentaje
}

interface Traducciones {
  [key: string]: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="label">{`${data.name}: ${data.value} (${data.percentage.toFixed(2)}%)`}</p>
      </div>
    );
  }
  return null;
};

export default function BlockChainPieChart({
  project,
}: BlockChainPieChartProps) {
  const [newChartData, setChartData] = useState<ChartDataItem[]>([]);
  const [globalTokenAmount, setGlobalTokenAmount] = useState<number>(0);

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
        labels: {
          color: '#DDD',
        },
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
  return (
    <Card className={`${colors.fuente}  h-full !bg-custom-dark-hover text-white`}>
      <Card.Header title={`Distribución total de tokens`} subtitle={`Cantidad total de tokens disponibles para cada grupo`} />
      <Card.Body>
        <Pie data={data} options={options} />
      </Card.Body>
    </Card>
  );
}
