import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
	foundElement: any; // Cambiar el tipo de acuerdo a la estructura de FoundElement
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


const PieChartComponent: React.FC<PieChartProps> = ({ foundElement }) => {
	const [chartData, setChartData] = useState<ChartDataItem[]>([]);

	useEffect(() => {
		if (foundElement) {
			const newChartData = foundElement.map((element: any) => ({
				name: element.tokenName,
				value: element.amountOfTokens,
			}));
			setChartData(newChartData);
		}
	}, [foundElement]);

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1942', '#00FF99', '#FF6600', '#8A2BE2'];

	return (
		<div className="w-full flex items-center justify-center">
			<ResponsiveContainer width="100%" height={300}>
				<PieChart width={600} height={300}>
					<Pie
						dataKey="value"
						data={chartData}
						cx="50%"
						cy="50%"
						outerRadius={100}
						innerRadius={50}
						fill="#8884d8"
						labelLine={false}
					>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
					<Legend layout="horizontal" align="center" verticalAlign="bottom" />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};

export default PieChartComponent;
