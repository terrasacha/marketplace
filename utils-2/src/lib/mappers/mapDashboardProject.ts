import { getActualPeriod } from "../utils-2";

function createLineChartData(data: Array<any>) {
    console.log(data,'data linechart')
    const dataToPlot = data.map(item => {
        let periods = item.product.productFeatures.items.filter((pf: any) => pf.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA")
        periods = JSON.parse(periods[0].value).map((p: any) => {
            return {
                period: parseInt(p.period),
                value: p.price,
                date: p.date,
                volume: p.amount,
            }
        })
        return {
            name: item.tokenName,
            data: periods,
            actualPeriod: getActualPeriod(Date.now(), periods),

        }
    })
    const dataToPlotVolume = data.map(item => {
        let periods = item.product.productFeatures.items.filter((pf: any) => pf.featureID === "GLOBAL_TOKEN_HISTORICAL_DATA")
        periods = JSON.parse(periods[0].value).map((p: any, index: number, array: any[]) => {
            const previousValues = array.slice(0, index).map((prev: any) => prev.amount);
            const sumPreviousValues = previousValues.reduce((acc: number, curr: number) => acc + curr, 0);
            return {
                period: parseInt(p.period),
                value: p.amount + sumPreviousValues,
                date: p.date,
            }
        })
        return {
            name: item.tokenName,
            data: periods,
            actualPeriod: getActualPeriod(Date.now(), periods),
        }
    })
    
    const maxPeriod = dataToPlot ? dataToPlot.sort((a, b) => b.data.length - a.data.length)[0]?.data.length : 0
    return {
        dataToPlot,
        maxPeriod,
        dataToPlotVolume
    }
}

export async function mapDashboardProject(transactions: Array<any>, project: any, projectData: any, projectId: string, walletStakeID: any) {
    const projectStatusMapper: any = {
        draft: 'En borrador',
        verified: 'Verificado',
        on_verification: 'En verificación',
        in_blockchain: 'En blockchain',
        in_equilibrium: 'En equilibrio',
        Prefactibilidad: 'En Prefactibilidad',
        Factibilidad: 'En Factibilidad',
        'Documento de diseño del proyecto': 'En diseño de documento del proyecto',
        'Validación externa': 'En validación externa',
        'Registro del proyecto': 'Registrado',
    };

    const newElements = transactions.filter((transaction: any) => transaction.stakeAddress === walletStakeID && transaction.productID === projectId);
    const totalTokens = newElements.reduce((sum: number, transaction: any) => sum + transaction.amountOfTokens, 0);
    const tokenHistoricalData = JSON.parse(
        project.productFeatures.items.filter((item: any) => {
            return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
        })[0]?.value || '[]'
    );

    const setUniquetokenData = new Set();
    const arrayUniqueTokenData = newElements.filter(item => !setUniquetokenData.has(item.tokenName) && setUniquetokenData.add(item.tokenName));
    const lineChartData = createLineChartData(arrayUniqueTokenData)
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
        const periods = tokenHistoricalData.map((tkhd: any) => {
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
        periods.sort((a: any, b: any) => parseInt(b.period) - parseInt(a.period));
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


    const tokenCurrency: string =
        project.productFeatures.items.filter((item: any) => {
            return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
        })[0]?.value || '';
    const periods = tokenHistoricalData.map((tkhd: any) => {
        return {
            period: tkhd.period,
            date: new Date(tkhd.date),
            price: tkhd.price,
            amount: tkhd.amount,
        };
    });
    const actualPeriod = getActualPeriod(Date.now(), periods);
    const totalTokensSold = project.transactions.items.reduce(
        (acc: any, item: any) => {
            return acc + item.amountOfTokens;
        },
        0
    );

    let relevantInfo = {
        name: project.name
            .toLowerCase()
            .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
        status: projectStatusMapper[project.status],
        dateOfInscription: project.createdAt.split('-')[0],
        category: project.category.name
            .toLowerCase()
            .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
        encodedCategory: encodeURIComponent(project.categoryID),
        tokenTotal: parseInt(actualPeriod?.amount),
        tokenUnits: parseInt(actualPeriod?.amount) - parseInt(totalTokensSold),
        tokenValue: actualPeriod?.price,
        tokenPercentageSold: (parseInt(totalTokensSold) * 100 ) / parseInt(actualPeriod?.amount) ,
        tokenCurrency: tokenCurrency,
    };
    const formatProjectDuration = (data: any) => {
        let year = ''
        let month = ''
        let day = ''

        if (data.days && data.days > 0) {
            day = data.days > 1 ? ` y ${data.days} días` : ` y ${data.days} día`
        }
        if (data.months && data.months > 0) {
            month = data.months > 1 ? ` ${data.months} meses` : ` ${data.months} mes`
        }
        if (data.years && data.years > 0) {
            year = data.years > 1 ? `${data.years} años,` : `${data.years} año,`
        }
        return `${year}${month}${day}`
    }
    let projectDuration = formatProjectDuration(projectData.projectInfo.token.lifeTimeProject)


    return {
        relevantInfo,
        totalTokensSold,
        totalTokens,
        projectDuration,
        totalGananciaCOP,
        totalGananciaUSD,
        totalInvestmentCOP,
        totalInvestmentUSD,
        lineChartData
    }


}