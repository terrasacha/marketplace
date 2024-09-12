import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartCustomProps {
  data: Array<ChartDataItem> | null; // Cambiar el tipo de acuerdo a la estructura de FoundElement
  width?: number | undefined;
  height?: number | undefined;
}

interface ChartDataItem {
  name: string;
  value: number;
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

export default function PieChartCustom(props: PieChartCustomProps) {
  const { data, width = 600, height = 300 } = props;

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

  return (
    <>
      {data && (
        <div className="w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart width={width} height={height}>
              <Pie
                dataKey="value"
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                fill="#8884d8"
                labelLine={false}
                paddingAngle={5}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" align="center" verticalAlign="top" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
