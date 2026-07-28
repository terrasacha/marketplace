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
      <div className="custom-tooltip bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2">
        <p className="label font-jostBold text-sm text-gray-800 mb-0">{`${data.name}`}</p>
        <p className="font-jostRegular text-sm text-gray-600 mb-0">
          Cantidad: {Number(data.value).toLocaleString('es-CO')}
        </p>
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

  const chartData = (data || []).filter((item) => Number(item.value) > 0);

  const renderLegendText = (value: string) => (
    <span className="font-jostRegular text-sm text-gray-700" title={value}>
      {value}
    </span>
  );

  return (
    <>
      {chartData.length > 0 && (
        <div className="w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart width={width} height={height}>
              <Pie
                dataKey="value"
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                fill="#8884d8"
                labelLine={false}
                paddingAngle={5}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="top"
                formatter={renderLegendText}
                wrapperStyle={{ paddingBottom: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
