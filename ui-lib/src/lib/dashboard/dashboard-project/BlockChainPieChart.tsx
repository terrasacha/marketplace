import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BlockChainPieChartProps {
  project: any;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface Traducciones {
  [key: string]: string;
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

export default function BlockChainPieChart({ project }: BlockChainPieChartProps) {
  const [newChartData, setChartData] = useState<ChartDataItem[]>([]);
  const [newData, setNewData] = useState<any>(null); // Nueva variable de estado

  const traducciones: Traducciones = {
    buffer: "Buffer",
    comunity: "Comunidad",
    investor: "Inversionista",
    owner: "Propietario",
    suan: "Suan",
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF1942",
    "#00FF99",
    "#FF6600",
    "#8A2BE2",
  ];

  useEffect(() => {
    const globalTokenTotalAmount = getGlobalTokenTotalAmount(project);
    const newData = getNewChartData(project);
    setNewData(newData);

    if (newData) {
      const chartData = transformDataForChart(newData, globalTokenTotalAmount);
      setChartData(chartData);
    }
  }, []);

  function getGlobalTokenTotalAmount(project: any): number {
    const GLOBAL_TOKEN_TOTAL_AMOUNT = "GLOBAL_TOKEN_TOTAL_AMOUNT";
    const featureItem = project.productFeatures.items.find(
      (item: any) => item.featureID === GLOBAL_TOKEN_TOTAL_AMOUNT
    );
    return featureItem ? Number(featureItem.value) : 0;
  }

  function getNewChartData(project: any): any {
    return JSON.parse(
      project.productFeatures.items.filter(
        (item: any) => item.featureID === "GLOBAL_TOKEN_AMOUNT_DISTRIBUTION"
      )[0]?.value || "[]"
    );
  }

  function transformDataForChart(
    data: any,
    totalAmount: number
  ): ChartDataItem[] {
    return Object.keys(data).map((key) => ({
      name: traducciones[key] || key,
      value: Number(((Number(data[key]) / totalAmount) * 100).toFixed(1)),
    }));
  }

  return (
    <div className="items-center justify-center flex sm:flex-row flex-col w-full">
      <p>
        Esta sera la distribución de los{" "}
        <strong>{getGlobalTokenTotalAmount(project)}</strong> tokens destinados
        a este proyecto
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            dataKey="value"
            data={newChartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            fill="#8884d8"
            labelLine={false}
          >
            {newChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" align="center" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
