import { getActualPeriod, mapTransactionListInfo } from "../utils-2";
import { coingeckoPrices } from '@marketplaces/data-access';
import { listTokensDashboard } from "@marketplaces/data-access";

async function getPolicyID(productID: string) {
    try {
        const response: any = await listTokensDashboard(productID)
        return response.data.data.listTokens.items[0].policyID || null
    } catch (error) {
        return null
    }
}
function calcutatePriceRate(currency: any, rate: any, adaprice: any, quantity: any) {
    const rateProjectCurrency = currency === "COP" ? rate.ADArateCOP : rate.ADArateUSD
    let total = parseInt(quantity) * adaprice * rateProjectCurrency
    console.log(total, 'total')
    return total
}
function createLineChartData(data: any) {
    const convert1 = (price: number) => { return (price / data[0].rates.ADArateCOP) * data[0].rates.ADArateUSD }
    const dataToPlot = data.map((item: any) => {
        let periods = item.periods
        periods = periods.map((p: any) => {
            let price = data[0].asset_currency === 'COP' ? convert1(p.price) : p.price
            return {
                period: parseInt(p.period),
                value: price,
                date: p.date,
                volume: p.amount,
            }
        })
        return {
            name: item.asset_name,
            data: periods,
            actualPeriod: getActualPeriod(Date.now(), periods),

        }
    })
    const dataToPlotVolume = data.map((item: any) => {
        let periods = item.periods;
        periods = periods.map((p: any, index: number, array: any[]) => {
            const previousValues = array.slice(0, index).map((prev: any) => {
                // Asegúrate de que amount sea un número
                const amount = parseInt(prev.amount, 10);
                return isNaN(amount) ? 0 : amount;
            });

            const sumPreviousValues = previousValues.reduce((acc: number, curr: number) => acc + curr, 0);

            // Asegúrate de que period y amount sean números
            const period = parseInt(p.period, 10);
            const amount = parseInt(p.amount, 10);

            return {
                period: isNaN(period) ? 0 : period,
                value: isNaN(amount) ? 0 : amount + sumPreviousValues,
                date: p.date,
            }
        });

        return {
            name: item.asset_name,
            data: periods,
            actualPeriod: getActualPeriod(Date.now(), periods),
        }
    });


    const maxPeriod = dataToPlot ? dataToPlot.sort((a: any, b: any) => b.data.length - a.data.length)[0]?.data.length : 0
    return {
        dataToPlot,
        maxPeriod,
        dataToPlotVolume
    }
}
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
        if (data.months === 0) {
            year = data.years > 1 ? `${data.years} años` : `${data.years} año`
        } else {
            year = data.years > 1 ? `${data.years} años,` : `${data.years} año,`
        }
    }
    return `${year}${month}${day}`
}
const calculateDeltaPrice = async (actualProfit: number, totalTokens: number, currency: string, rates: any) => {
    if (!actualProfit || actualProfit === 0) return 0
    const totalDelta = actualProfit
    //const ADArateUSD = await coingeckoPrices("cardano", "USD")
    if (currency === "COP") {
        //const ADArateCOP = await coingeckoPrices("cardano", "COP")
        return ((totalDelta / rates.ADArateCOP) * rates.ADArateUSD).toFixed(4)
    }
    return (totalDelta / rates.ADArateUSD).toFixed(4)
}
const calculateActualTokenPrice = (actualPrice: number | string, currency: string, rates: any) => {

    const price = typeof actualPrice === 'string' ? parseFloat(actualPrice) : actualPrice;

    if (!price) return "unknown"

    if (currency === "COP") {
        //const ADArateCOP = await coingeckoPrices("cardano", "COP")
        return ((price / rates.ADArateCOP) * rates.ADArateUSD).toFixed(4)
    }
    return price.toFixed(2)
}
const infoDistributionTokens = (data: any, historicalData: any) => {
    const parseData = JSON.parse(data)
    const parseHistoricalData = JSON.parse(historicalData)
    const totalDistribution = parseData.reduce((acc: number, item: any) => acc + parseInt(item.CANTIDAD), 0);
    const percentages = parseData.map((item: any) => {
        const percentages = (item.CANTIDAD / totalDistribution) * 100;
        return { ...item, PORCENTAJE: percentages };
    });
    const tokensPerPeriod = percentages.map((percentage: any) => {
        let cantPerPeriod = parseHistoricalData.map((item: any) => {
            return { period: item.period, amount: Math.floor(item.amount * (percentage.PORCENTAJE / 100)) }
        })
        return { CONCEPTO: percentage.CONCEPTO, periods: cantPerPeriod }
    })


    return tokensPerPeriod
}
const getTokensInversionst = (pfs: Array<any>) => {
    const pfDistribution = pfs.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
    })[0]?.value

    const inversionistDistribution = JSON.parse(pfDistribution).find((item: any) => item.CONCEPTO === 'INVERSIONISTA').CANTIDAD

    return inversionistDistribution
}
const getRates = async () => {
    const response = await fetch('/api/calls/getRates')
    const data = await response.json()
    let dataFormatted: any = {}
    data.map((item: any) => {
        let obj = `ADArate${item.currency}`
        dataFormatted[obj] = item.value.toFixed(4)
    });
    return dataFormatted
}
export async function mapDashboardProject(project: any, projectData: any, projectId: string, walletData: any) {
    console.log('project', projectData)
    const projectPolicyID = await getPolicyID(projectData.projectInfo.id)
    console.log(projectPolicyID, 'projectPolicyID')
    const rates = await getRates()
    const projectTokenDistribution = project.productFeatures.items.filter((pf: any) => pf.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION')[0].value
    const projectMunicipio = project.productFeatures.items.filter((pf: any) => pf.featureID === 'A_municipio')[0].value
    const projectVereda = project.productFeatures.items.filter((pf: any) => pf.featureID === 'A_vereda')[0].value
    const projectPeriod = project.productFeatures.items.filter((pf: any) => pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA')[0].value
    const projectTokenName = project.productFeatures.items.filter((pf: any) => pf.featureID === 'GLOBAL_TOKEN_NAME')[0].value
    const projectCurrency = project.productFeatures.items.filter((pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY')[0].value
    const assetFromSuan = walletData.assets.filter((asset: any) => asset.policy_id === projectPolicyID)
    console.log(walletData.assets, 'walletData.assets')
    console.log(assetFromSuan, 'assetFromSuan')
    const dataFromQuery = await fetch('/api/calls/getPeriodToken', {
        method: 'POST',
        body: JSON.stringify({
            assets_name: assetFromSuan.map((asset: any) => asset.asset_name)
        }),
    }
    )
    const data = await dataFromQuery.json()
    console.log(data, 'data171')
    const asset = assetFromSuan.filter((asset: any) => asset.productID === projectId)
    const lineChartData = createLineChartData([{
        //@ts-ignore
        periods: JSON.parse(projectPeriod),
        asset_name: projectTokenName,
        asset_currency: projectCurrency,
        rates
    }])
    console.log(asset, 'assetMap')
    const totalTokens = assetFromSuan[0]?.quantity || 0 /* ? parseInt(asset[0].quantity) : 0 */


    const tokenHistoricalData = JSON.parse(
        project.productFeatures.items.filter((item: any) => {
            return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
        })[0]?.value || '[]'
    );

    const periods = tokenHistoricalData.map((tkhd: any) => {
        return {
            period: tkhd.period,
            date: new Date(tkhd.date),
            price: tkhd.price,
            amount: tkhd.amount,
        };
    });
    const actualPeriod = getActualPeriod(Date.now(), periods);
    const actualProfit = actualPeriod && actualPeriod.price - tokenHistoricalData[0].price || 0
    const actualProfitPercentage = actualPeriod && ((actualPeriod.price - tokenHistoricalData[0].price) * 100) / tokenHistoricalData[0].price || "0.0"
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




    const tokenCurrency: string =
        project.productFeatures.items.filter((item: any) => {
            return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
        })[0]?.value || '';

    const totalAmountOfTokens = project.productFeatures.items.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_TOTAL_AMOUNT';
    })[0]?.value
    console.log()
    const totalTokensSold = project.transactions.items.reduce(
        (acc: any, item: any) => {
            return acc + item.amountOfTokens;
        },
        0
    );
    const tokensToInversionists = getTokensInversionst(project.productFeatures.items)
    let relevantInfo = {
        name: project.name
            .toLowerCase()
            .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
        status: projectStatusMapper[project.status],
        dateOfInscription: project.createdAt.split('-')[0],
        category: project.category.name
            .toLowerCase()
            .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
        municipio: projectMunicipio,
        vereda: projectVereda,
        encodedCategory: encodeURIComponent(project.categoryID),
        tokenTotal: parseInt(actualPeriod?.amount),
        tokenUnits: parseInt(actualPeriod?.amount) - parseInt(totalTokensSold),
        tokenValue: actualPeriod?.price,
        tokenPercentageSold: ((parseInt(totalTokensSold) * 100) / tokensToInversionists).toFixed(2),
        tokenPercentageTokensOwn: ((totalTokens * 100) / totalAmountOfTokens).toFixed(2),
        totalAmountOfTokens,
        tokenCurrency: tokenCurrency,
    };
    const stackData = infoDistributionTokens(projectTokenDistribution, projectPeriod)
    const projectDuration = formatProjectDuration(projectData.projectInfo.token.lifeTimeProject)
    const actualTokenPriceUSD = calculateActualTokenPrice(projectData.projectInfo.token.actualPeriodTokenPrice, relevantInfo.tokenCurrency, rates)
    const tokenDeltaPrice = await calculateDeltaPrice(actualProfit, totalTokens, relevantInfo.tokenCurrency, rates)
    const progressproject = projectData.projectInfo.token.actualPeriod && (projectData.projectInfo.token.actualPeriod / projectData.projectInfo.token.historicalData.length) * 100 || "0.0"
    const totalValueTokensAdas = data * parseInt(assetFromSuan[0].quantity)
    const totalValueRate = calcutatePriceRate(relevantInfo.tokenCurrency, rates, totalValueTokensAdas, totalTokens)
    return {
        asset: asset[0],
        totalValueRate: totalValueRate.toFixed(2),
        relevantInfo,
        totalAmountOfTokens,
        tokensToInversionists,
        totalTokensSold,
        totalTokens,
        tokenDeltaPrice,
        actualTokenPriceUSD,
        rates,
        progressproject: progressproject.toFixed(2),
        projectDuration,
        actualProfit,
        actualProfitPercentage,
        lineChartData,
        stackData
    }


}