import DashboardItem from "./DashboardItem";

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
interface PeriodData {
	period: any;
	startDate: Date;
	endDate: Date;
	price: number;
	amount: number;
}

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
		const tokenCurrency = transaction.product.productFeatures.items.find(pf => pf.featureID === 'GLOBAL_TOKEN_CURRENCY')?.value
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
		let periodOfBuy = determinatePeriodOfBuy(transactionDate, tokenHistoricalData)
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
				token_name: transaction.tokenName,
				transactionDate,
				tokenRange,
				tokenCurrency,
				periodOfBuy
			};
		} else {
			return {
				lastPrice: null,
				amountOfTokens: transaction.amountOfTokens,
				token_name: transaction.tokenName,
				totalValue: null,
				transactionDate,
				tokenRange,
				tokenCurrency,
				periodOfBuy
			};
		}
	});
	function determinatePeriodOfBuy(dateOfTransaction : any, tokenHData : Array<any>) {
		dateOfTransaction = new Date(dateOfTransaction);
		const index = tokenHData.findIndex(periodo => dateOfTransaction < new Date(periodo.date));
		return index === -1 ? tokenHData[tokenHData.length] : tokenHData[index]
	}
	// Calcula la suma de los totalValue de todos los elementos en results

	let totalInvestmentCOP = 0
	let totalInvestmentUSD = 0
	let totalSumValueCOP = 0
	let totalSumValueUSD = 0
	let totalGananciaCOP = 0
	let totalGananciaUSD = 0
	console.log(results)
	results.forEach(result => {
		if (typeof result.totalValue === "number") {
			//@ts-ignore
			if (result.tokenCurrency === 'COP') {
				totalInvestmentCOP += result.periodOfBuy.price * result.amountOfTokens;
				totalSumValueCOP += result.totalValue
			//@ts-ignore
			} else if (result.tokenCurrency === 'USD') {
				totalInvestmentUSD += result.periodOfBuy.price * result.amountOfTokens;
				totalSumValueUSD += result.totalValue
			}
		}
	});
	totalGananciaCOP = totalSumValueCOP - totalInvestmentCOP
	totalGananciaUSD = totalSumValueUSD - totalInvestmentUSD

	console.log(totalInvestmentCOP, 'totalInvestmentCOP')
	console.log(totalInvestmentUSD, 'totalInvestmentUSD')
	console.log(totalSumValueCOP, 'totalSumValueCOP')
	console.log(totalSumValueUSD, 'totalSumValueUSD')
	console.log(totalGananciaCOP, 'totalGananciaCOP')
	console.log(totalGananciaUSD, 'totalGananciaUSD')
	return (
		<div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
			<DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
				value={`${totalInvestmentCOP} COP`}
				label="Total invertido"
				
			/>
			<DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
				value={`${totalTokens}`}
				label="Tokens comprados"
			/>
			<DashboardItem
				icon={<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
				value={`${totalGananciaCOP} COP`}
				label="Ganancia total"
			/>
		</div>
	);
};

export default ItemsDashboard;
