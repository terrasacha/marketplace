import React from 'react';
import { Card } from '../ui-lib';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export default function StackBarGraphComponent(props: any) {
  const { stackData } = props;
  console.log(stackData, 'stackData');

  const scales = {
    x: {
      stacked: true,
      ticks: {
        color: '#DDDDDD',
      },
      grid: {
        color: '#4C4C4C',
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: '#DDDDDD',
      },
      grid: {
        color: '#4C4C4C',
      },
    },
  };
  const options = {
    plugins: {
      legend: {
        labels: {
          color: '#DDD',
        },
      },
    },
    responsive: true,
    scales,
  };
  const backgrounds = [
    'rgb(255, 99, 132)',
    'rgb(75, 192, 192)',
    'rgb(53, 162, 235)',
    'rgb(255, 205, 86)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
  ];
  const labels = stackData[0].periods.map((item: any) => item.period);
  const datasets = stackData.map((item: any, index: number) => {
    return {
      label: item.CONCEPTO,
      data: item.periods.map((period: any) => period.amount),
      backgroundColor: backgrounds[index],
    };
  });
  const data = {
    labels,
    datasets,
  };

  return (
    <Card className="h-fit !bg-custom-dark-hover text-white">
      <Card.Header
        title={`Tabla de redención`}
        subtitle={`Al finalizar cada periodo la siguiente cantidad de tokens podrán ser intercambiados por SUANCO2`}
      />
      <Card.Body>
        <Bar options={options} data={data} />
      </Card.Body>
    </Card>
  );
}
