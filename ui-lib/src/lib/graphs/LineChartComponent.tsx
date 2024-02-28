import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)


const labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8']


export const data = {
  labels,
  datasets: [
    {
      label: 'Token 1',
      data: [
        {"value": 700, "period": 0},
        {"value": 708, "period": 1},
        {"value": 716, "period": 2},
        {"value": 725, "period": 3},
        {"value": 733, "period": 4},
        {"value": 741, "period": 5},
        {"value": 750, "period": 6},
        {"value": 758, "period": 7},
        {"value": 766, "period": 8},
      ],
      segment: {
        borderDash: ((ctx :any) => {
          if(ctx.p0.raw.period > 1) return [4,4]
          return [0, 0]
        }),
      },
      borderColor: 'rgb(217 119 6)',
      backgroundColor: 'rgba(217, 119, 6, 0.5)',
      stepped: 'before',
    },
    {
      label: 'Token 2',
      data: [
        {"value": 700, "period": 0},
        {"value": 710, "period": 1},
        {"value": 710, "period": 2},
        {"value": 745, "period": 3},
        {"value": 760, "period": 4},
        {"value": 770, "period": 5},
        {"value": 810, "period": 6},
        {"value": 810, "period": 7},
        {"value": 820, "period": 8},
      ],
      segment: {
        borderDash: ((ctx :any) => {
          if(ctx.p0.raw.period > 1) return [4,4]
          return [0, 0]
        }),
      },
      borderColor: ' rgb(251 191 36)',
      backgroundColor: 'rgba(251, 191, 36, 0.5)',
      stepped: 'before',
    },
  ],
}
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      display: true,
      labels: {
        color: '#DDD',
        filter: function(item : any) {
          return item.text !== false
        }
      }
    }
  },
  title: {
    display: true,
    text: 'Evolución de proyectos',
  },
  scales: {
    x: {
      ticks: {
        color: '#DDDDDD'
      },
      grid: {
        color: '#4C4C4C'
      },
      title: {   
        display: true,
        text: 'Periodo',
        color: '#DDDDDD' 
      }
    },
    y: {
      ticks: {
        color: '#DDDDDD'
      },
      grid: {
        color: '#4C4C4C'
      },
      title: {   
        display: true,
        text: 'Valor',
        color: '#DDDDDD' 
      }
    },
  },
  data,
  parsing: {
    xAxisKey: 'period',
    yAxisKey: 'value'
  }
}
export default function LineChartComponent() {
  return(
        //@ts-ignore
        <Line options={options} data={data} />
  ) 
}