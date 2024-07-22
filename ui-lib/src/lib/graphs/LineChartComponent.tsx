import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  const { lineChartData, plotVolume } = props;
  const [chartData, setChartData] = useState(lineChartData);

  useEffect(() => {
    if (JSON.stringify(lineChartData) !== JSON.stringify(chartData)) {
      setChartData(lineChartData);
    }
  }, [lineChartData, chartData]);

  const labels = useMemo(
    () =>
      Array.from(
        { length: chartData.maxPeriod + 1 },
        (_, index) => index.toString()
      ),
    [chartData.maxPeriod]
  );

  const datasets = useMemo(() => {
    const baseDatasets = chartData.dataToPlot
      ? chartData.dataToPlot.map((item: any) => {
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
        })
      : [];

    if (plotVolume) {
      baseDatasets.push(
        ...chartData.dataToPlotVolume.map((item: any) => {
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

    return baseDatasets;
  }, [chartData.dataToPlot, chartData.dataToPlotVolume, plotVolume]);

  const scales = useMemo(() => {
    const baseScales = {
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
          text: 'Valor del token expresado en USD',
          color: '#DDDDDD',
        },
        min: 0, 
      },
    };

    if (plotVolume) {
      //@ts-ignore
      baseScales.y1 = {
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
          text: 'Volumen de tonelada de carbono capturada(tCO2eq)',
          color: '#DDDDDD',
        },
        min: 0, 
      };
    }

    return baseScales;
  }, [plotVolume]);

  const data = useMemo(
    () => ({
      labels,
      datasets,
    }),
    [labels, datasets]
  );

  const options = useMemo(
    () => ({
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
    }),
    [scales]
  );

  const LineChart = useCallback(() => {
    //@ts-ignore
    return <Line options={options} data={data} />;
  }, [options, data]);

  return (
    <div className="p-1 w-full h-full">
      <LineChart />
    </div>
  );
}
