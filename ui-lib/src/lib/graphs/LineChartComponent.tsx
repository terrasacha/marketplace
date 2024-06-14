import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LineChartComponent(props: any) {
  const { axisColor, graphsColor, lineChartData, plotVolume } = props;
  lineChartData.dataToPlot[0].data.unshift({period: 0, value: lineChartData.dataToPlot[0].data[0].value || 0, date: lineChartData.dataToPlot[0].data[0].date || 0, volume: lineChartData.dataToPlot[0].data[0].volume || 0})
  lineChartData.dataToPlotVolume[0].data.unshift({period: 0, value: 0, date: lineChartData.dataToPlotVolume[0].data[0].date || 0})
  const labels = Array.from(
    { length: lineChartData.maxPeriod + 1 },
    (_, index) => index.toString()
  );
  console.log(lineChartData, 'lineChartData');
  const datasets = lineChartData.dataToPlot
    ? [
        ...lineChartData.dataToPlot.map((item: any) => {
          return {
            label: item.name,
            data: item.data,
            segment: {
              borderDash: (ctx: any) => {
                if (ctx.p0.raw.period > item.actualPeriod.period - 1 || 0)
                  return [4, 4];
                return [0, 0];
              },
            },
            borderColor: 'rgb(217 119 6)',
            backgroundColor: 'rgba(217, 119, 6, 0.5)',
            stepped: 'after',
          };
        }),
      ]
    : [];

  if (plotVolume) {
    datasets.push(
      ...lineChartData.dataToPlotVolume.map((item: any) => {
        return {
          label: 'Volumen (tCO2eq)',
          data: item.data,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          yAxisID: 'y1',
          fill: true,
        };
      })
    );
  }

  const scales = {
    x: {
      ticks: {
        color: '#DDDDDD',
      },
      grid: {
        color: '#4C4C4C',
      },
      title: {
        display: true,
        text: 'Periodo',
        color: '#DDDDDD',
      },
    },
    y: {
      ticks: {
        color: '#DDDDDD',
      },
      grid: {
        color: '#4C4C4C',
      },
      title: {
        display: true,
        text: 'Valor del token $USD',
        color: '#DDDDDD',
      },
      min: 0, // Asegura que el eje Y comience en 0
    },
  };

  if (plotVolume) {
    //@ts-ignore
    scales.y1 = {
      position: 'right',
      ticks: {
        color: '#DDDDDD',
      },
      grid: {
        display: false,
        color: '#4C4C4C',
      },
      title: {
        display: true,
        text: 'Volumen (tCO2eq)',
        color: '#DDDDDD',
      },
      min: 0, // Asegura que el eje Y de volumen comience en 0
    };
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
        labels: {
          color: '#DDD',
          filter: function (item: any) {
            return item.text !== false;
          },
        },
      },
    },
    title: {
      display: true,
      text: 'Evolución de proyectos',
    },
    scales,
    parsing: {
      xAxisKey: 'period',
      yAxisKey: 'value',
    },
  };

  const LineChart = () => {
    //@ts-ignore
    return <Line options={options} data={data} />;
  };

  return (
    <div className="p-1 w-full h-full">
      <LineChart />
    </div>
  );
}
