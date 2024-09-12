import React from 'react';
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
const colors = ['#666de9', '#cc674e'];
export default function BarGraphComponent(props: any) {
  const { infoBarGraph } = props;

  // Función para generar datos aleatorios
  const generateRandomData = () => {
    return labels.map(() => Math.floor(Math.random() * 1000));
  };
  const prepareDataSets = () => {
    let datasets: any = [];
    infoBarGraph.data.map((item: any, index: number) => {
      datasets.push({
        label: item.name,
        data: item.y,
        backgroundColor: colors[index],
      });
    });
    return datasets;
  };
  const datasets = prepareDataSets();

  const labels: any = infoBarGraph.data[0].x.map((item: any) => item);
  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolución de Áreas',
      },
    },
  };
  return <Bar options={options} data={data} />;
}
