import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartComponent(props: any) {
  const { foundElement } = props;

  const data = {
    labels: foundElement.map((item: any) => item.tokenName),
    datasets: [
      {
        label: 'Tokens repartidos',
        data: foundElement.map((item: any) => item.amountOfTokens),
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

  return <Pie data={data} options={options} />;
}
