import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

const ProjectionsTab: React.FC<any> = ({ projectionData }) => {

  // Obtener el histórico de precios del token
  const historicalDataFeature = projectionData.productFeatures.items.find((item: any) => item.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA");
  const historicalData = historicalDataFeature ? JSON.parse(historicalDataFeature.value) : [];

  // Preparar los datos para el gráfico
  const chartData = historicalData.map((valueObj: { date: string; amount: number }) => ({
    date: valueObj.date,
    amount: valueObj.amount,
  }));

  const chartData2 = historicalData.map((valueObj: { date: string; price: number }) => ({
    date: valueObj.date,
    price: valueObj.price,
  }));

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


  return (
    <div className='flex flex-col sm:flex-row'>
      <div className="mb-4 sm:mb-0" style={{ flex: 1 }}> {/* Agregamos estilo flex: 1 para que ocupe todo el ancho */}
        <strong className='ml-5 mb-5'>Volumen</strong>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                const options = { year: 'numeric', month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions;
                return new Date(date).toLocaleDateString('es-ES', options);
              }}
            />
            <YAxis dataKey="amount" />
            <Tooltip />
            {/* <Legend /> */}
            <Bar dataKey="amount" fill="#2e966a" barSize={60} shape={(props) => (
              <RoundBar
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
              />
            )} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1 }}> {/* Agregamos estilo flex: 1 para que ocupe todo el ancho */}
        <strong className='ml-5 mb-5'>Valor token (usd)</strong>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData2}>
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
            <Bar dataKey="price" fill="#0e7490" barSize={60} shape={(props) => (
              <RoundBar2
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
              />
            )} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  
};

export default ProjectionsTab;

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
      <rect x={x} y={y} width={width} height={height} rx={8} ry={8} fill="#2e966a" />
    </g>
  );
};

const RoundBar2: React.FC<RoundBarProps> = (props) => {
  const { x, y, width, height } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} ry={8} fill="#2e7d96" />
    </g>
  );
};

