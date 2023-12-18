import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TransactionData {
  tokenName: string;
  transactionDetails: TransactionDetail[];
  amountOfTokens: number;
}

interface TransactionDetail {
  createdAt: string;
  amountOfTokens: number;
  product: Product;
}

interface Product {
  category: {
    name: string;
  };
  createdAt: string;
  description: string;
  name: string;
  GLOBAL_TOKEN_HISTORICAL_DATA: string;
  productFeatures: {
    items: ProductFeature[];
  };
}

interface ProductFeature {
  featureID: string;
  value: string;
}

interface AreaChartProps {
  selectedElement: TransactionData | null;
}

const AreaChartComponent: React.FC<AreaChartProps> = ({ selectedElement }) => {
  if (!selectedElement) {
    return null; // Manejar el caso cuando no se ha seleccionado ningún elemento
  }
  const { transactionDetails } = selectedElement;

  // Obtener el histórico de precios del token
  const historicalDataFeature = transactionDetails[0].product.productFeatures.items.find(item => item.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA");
  const historicalData = historicalDataFeature ? JSON.parse(historicalDataFeature.value) : [];

  // Preparar los datos para el gráfico
  const chartData = historicalData.map((valueObj: { date: string; price: number }) => ({
    date: valueObj.date,
    price: valueObj.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart  data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
            return new Date(date).toLocaleDateString('es-ES', options);
          }}
        />
        <YAxis dataKey="price" />
        <Tooltip />
        {/* <Legend /> */}
        <Bar dataKey="price" fill="#2e7d96" barSize={60} shape={(props) => (
          <RoundBar
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
          />
        )} />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default AreaChartComponent;
// Props explícitas para el componente personalizado RoundBar
interface RoundBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Componente personalizado para barras redondeadas
const RoundBar: React.FC<RoundBarProps> = (props) => {
  const { x, y, width, height } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} ry={8} fill="#2e7d96" />
    </g>
  );
};
