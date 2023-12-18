interface Transaction {
	tokenName: string;
	txHash: string;
	createdAt: string;
	amountOfTokens: number;
	product: {
	  name: string;
	  productFeatures: {
		items: {
		  value: number;
		  featureID: string;
		}[];
	  };
	};
  }

interface ItemsDashboardProps {
	NewElements: Transaction[];
}

interface DashboardItemProps {
	icon: JSX.Element;
	value: string;
	label: string;
}

interface PeriodData {
	period: any;
	startDate: Date;
	endDate: Date;
	price: number;
	amount: number;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ icon, value, label }) => {
	return (
		<div className="bg-white dark:bg-[#69a1b3] shadow-lg rounded-md flex items-center justify-between p-4 m-4 border-b-4 border-white dark:border-[#588695] text-[#69a1b3] dark:text-gray-800 font-medium group">
			<div className="flex justify-center items-center w-14 h-14 bg-[#69a1b3] dark:bg-white rounded-full transition-all duration-300 transform group-hover:rotate-12">
				{icon}
			</div>
			<div className="text-right">
				<p className="text-[#6b7587] text-2xl">{value}</p>
				<p>{label}</p>
			</div>
		</div>
	);
};

const ItemsDashboard: React.FC<ItemsDashboardProps> = ({ NewElements }) => {

	const totalTokens = NewElements.reduce((sum, transaction) => sum + transaction.amountOfTokens, 0); //Tokens Invertidos - General
	const results = NewElements.map((transaction, index) => {
		const transactionDateFormat = transaction.createdAt;
		const transactionDate = transactionDateFormat.slice(0, 10); 
		const tokenHistoricalData = JSON.parse(
			(transaction.product.productFeatures.items.find(
				(feature) => feature.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA"
			)?.value || "[]").toString()
		)

		tokenHistoricalData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
		const periods: PeriodData[] = tokenHistoricalData.map((tkhd: any) => {
			return {
				period: tkhd.period,
				date: new Date(tkhd.date),
				datePeriod: tkhd.date,
				price: tkhd.price,
				amount: tkhd.amount,
			};
		});

		//Rango de fechas
		let startDate: any = 0; // Inicializa la fecha de inicio en null
		const tokenRange = tokenHistoricalData.map((tkhd: any, tkhdIndex: number) => {
			const endDate = tkhd.date;
			if (tkhdIndex > 0) {
				// Si no es el primer periodo, calcula la fecha de inicio como un día después de la fecha final del periodo anterior
				const previousEndDate = new Date(tokenHistoricalData[tkhdIndex - 1].date);
				previousEndDate.setDate(previousEndDate.getDate() + 1);
				startDate = previousEndDate.toISOString().split('T')[0]; // Convierte a formato 'YYYY-MM-DD'
			}
			return {
				...tkhd,
				startDate,
				endDate,
			};
		});
		periods.sort((a, b) => parseInt(b.period) - parseInt(a.period));
		const lastPeriod = periods[0];

		if (lastPeriod) {
			const lastPrice = lastPeriod.price;
			const amountOfTokens = transaction.amountOfTokens;
			const totalValue = lastPrice * amountOfTokens;

			return {
				lastPrice,
				amountOfTokens,
				totalValue,
				transactionDate,
				tokenRange,
			};
		} else {
			return {
				lastPrice: null,
				amountOfTokens: transaction.amountOfTokens,
				totalValue: null,
				transactionDate,
				tokenRange,
			};
		}
	});
	// Calcula la suma de los totalValue de todos los elementos en results
	const totalValueSum = results.reduce((sum, result) => {
		if (typeof result.totalValue === "number") {
			return sum + result.totalValue;
		}
		return sum;
	}, 0);

	let totalInvestment = 0; // Inicializa totalInvestment en 0
	let totalGanancia = 0; // Inicializa totalInvestment en 0

	results.forEach((result, index) => {
		// Determinar si transactionDate está dentro del rango de tokens
		const tokenInRange = result.tokenRange.find((token: any) => {
			const startDate = new Date(token.startDate);
			const endDate = new Date(token.endDate);
			const transactionDate = new Date(result.transactionDate);
			return transactionDate >= startDate && transactionDate <= endDate;
		});
	
		if (tokenInRange) {
			const amountOfTokensTimesPrice = result.amountOfTokens * tokenInRange.price;
			totalInvestment += amountOfTokensTimesPrice;
			const gananciaFinal = totalValueSum - totalInvestment;
			totalGanancia = gananciaFinal;
			
		} else {
			console.log("La transacción no está dentro del rango de ningún token.");
		}
	});

	return (
		<div className="dashboard-items m-2 flex flex-col justify-between">
			<DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
				value={`$${totalInvestment}`}
				label="Inversión Total"
				
			/>
			<DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
				value={`$${totalGanancia}`}
				label="Ganancia Esperada"
			/>
			<DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
				value={`${totalTokens}`}
				label="Tokens Invertidos"
			/>
			{/* <DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
				value="0%"
				label="Global"
			/> */}

		</div>
	);
};

export default ItemsDashboard;
