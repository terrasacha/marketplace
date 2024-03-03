import { getActualPeriod } from "../utils-2";

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


function createLineChartData(data: Array<any>) {
    const dataToPlot = data.map(item => {
        let periods = item.product.productFeatures.items.filter((pf: any) => pf.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA")
        periods = JSON.parse(periods[0].value).map((p: any) => {
            return {
                period: parseInt(p.period),
                value: p.price,
                date: p.date
            }
        })
        return {
            name: item.tokenName,
            data: periods,
            actualPeriod: getActualPeriod(Date.now(), periods)
        }
    })
    const maxPeriod = dataToPlot ? dataToPlot.sort((a, b) => b.data.length - a.data.length)[0]?.data.length : 0
    return {
        dataToPlot,
        maxPeriod
    }
}
export async function mapTransactionListDashboard(transactions: Array<any>, walletStakeID: any, assets: any) {
    const newElements = transactions.filter(transaction => transaction.stakeAddress === walletStakeID);
    const setUniquetokenData = new Set();
    const arrayUniqueTokenData = newElements.filter(item => !setUniquetokenData.has(item.tokenName) && setUniquetokenData.add(item.tokenName));

    const lineChartData = createLineChartData(arrayUniqueTokenData)

    const groupedData = newElements.reduce((acc, item) => {
        const { tokenName, createdAt, amountOfTokens, product, ...rest } = item;

        if (!acc[tokenName]) {
            acc[tokenName] = {
                tokenName,
                transactionsDetail: [],
            };
        }

        acc[tokenName].transactionsDetail.push({
            createdAt,
            amountOfTokens,
            product,
            ...rest,
        });

        return acc;
    }, {});

    // Nuevo array con la información agrupada por nombre de token
    const otroArray = Object.values(groupedData);
    const FoundElement: any = otroArray.map((foundElement: any) => {
        const matchingAsset = assets && assets.find((asset: any) => {
            return asset.assetName === foundElement.tokenName;
        });

        if (matchingAsset) {
            const amountOfTokens = parseFloat(matchingAsset.quantity);
            return {
                amountOfTokens,
                tokenName: foundElement.tokenName,
                projectName: foundElement.transactionsDetail[0].product.name || '',
                projectID: foundElement.transactionsDetail[0].product.id || ''
            };
        }
        return {
            amountOfTokens: 0,
            tokenName: foundElement.tokenName,
            projectName: foundElement.transactionsDetail[0].product.name || '',
            projectID: foundElement.transactionsDetail[0].product.id || ''
        };
    }).filter(element => element.amountOfTokens !== null && element.amountOfTokens !== 0)
        .sort((a, b) => b.amountOfTokens - a.amountOfTokens)

    const totalTokens = newElements.reduce((sum, transaction) => sum + transaction.amountOfTokens, 0); //Tokens Invertidos - General
    const results = newElements.map((transaction, index) => {
        const transactionDateFormat = transaction.createdAt;
        const transactionDate = transactionDateFormat.slice(0, 10);
        const tokenHistoricalData = JSON.parse(
            (transaction.product.productFeatures.items.find(
                (feature: any) => feature.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA"
            )?.value || "[]").toString()
        )
        const tokenCurrency = transaction.product.productFeatures.items.find((pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY')?.value
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
    function determinatePeriodOfBuy(dateOfTransaction: any, tokenHData: Array<any>) {
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


    return {
        lineChartData,
        FoundElement,
        inversion: {
            totalInvestmentCOP,
            totalTokens,
            totalGananciaCOP
        }
    }


}