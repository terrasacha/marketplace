import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['Token 1', 'Token 2'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19],
      backgroundColor: [
        'rgba(217, 119, 6, 0.7)',
        'rgba(251, 191, 36, 0.7)',
      ],
      borderColor: [
        'rgba(217, 119, 6, 1)',
        'rgba(251, 191, 36, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const options = {
  plugins: {
    legend: {
      labels: {
        color: '#DDD',
      },
    },
  },
};

export default function PieChartComponent() {
  return (
    <Pie data={data} options={options} />
  );
}
