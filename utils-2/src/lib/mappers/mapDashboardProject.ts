import { getActualPeriod, mapTransactionListInfo } from "../utils-2";
import { coingeckoPrices } from '@marketplaces/data-access';

function createLineChartData(data: Array<any>) {
    console.log(data,'createLineChartData')
    const dataToPlot = data.map(item => {
        let periods = item.periods
        periods = periods.map((p: any) => {
            return {
                period: parseInt(p.period),
                value: p.price,
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
    const dataToPlotVolume = data.map(item => {
        let periods = item.periods
        periods = periods.map((p: any, index: number, array: any[]) => {
            const previousValues = array.slice(0, index).map((prev: any) => prev.amount);
            const sumPreviousValues = previousValues.reduce((acc: number, curr: number) => acc + curr, 0);
            return {
                period: parseInt(p.period),
                value: p.amount + sumPreviousValues,
                date: p.date,
            }
        })
        return {
            name: item.asset_name,
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
const getTransactionsData = async (stake_address : string, address : string) => {
    const payload = {
      stake: stake_address,
      all: true
    };
    const response = await fetch('/api/transactions/account-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    const paginationMetadataItem = {
      currentPage: responseData.current_page,
      pageSize: responseData.page_size,
      totalItems: responseData.total_count,
    };
    const mappedTransactionListData = await mapTransactionListInfo({
      walletAddress: address,
      data: responseData.data,
    });
    const filterMappedTransactionListData = mappedTransactionListData.filter(
      (transaction : any) =>
        transaction.outputUTxOs.some((output : any) =>
          output.asset_list.some(
            (asset: any) =>
              asset.policy_id ===
              '8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83'
          )
        ) ||
        transaction.inputUTxOs.some((input : any) =>
          input.asset_list.some(
            (asset: any) =>
              asset.policy_id ===
              '8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83'
          )
        )
    );
    return filterMappedTransactionListData
  };
export async function mapDashboardProject( project: any, projectData: any, projectId: string, walletData: any) {

    console.log(project)
    const projectMunicipio = project.productFeatures.items.filter( (pf : any) => pf.featureID === 'A_municipio')[0].value
    const projectVereda = project.productFeatures.items.filter( (pf : any) => pf.featureID === 'A_vereda')[0].value
    const projectPeriod = project.productFeatures.items.filter( ( pf : any) => pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA')[0].value
    const projectTokenName = project.productFeatures.items.filter( (pf : any) => pf.featureID === 'GLOBAL_TOKEN_NAME')[0].value
    const assetFromSuan = walletData.assets.filter((asset : any)=> asset.policy_id === "8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83")
    const dataFromQuery = await fetch('/api/calls/getPeriodToken',{
        method: 'POST',
        body: JSON.stringify({
            assets_name: assetFromSuan.map((asset : any) => asset.asset_name)
        }),
    }
    )
    const data = await dataFromQuery.json() 
    assetFromSuan.forEach((item : any)=> {
        let match = data.find((item2 : any)=> item2.asset_name === item.asset_name);
        if (match){
            item.productID = match.productID
            item.currency = match.currency
            item.periods = JSON.parse(match.periods)
        };
        item.actualPeriod = getActualPeriod(Date.now(), item.periods);
        item.diffBetweenFirsLastPeriod = item.actualPeriod && item.actualPeriod.price - item.periods[0].price || 0
    });
    const asset = assetFromSuan.filter((asset : any)=> asset.productID === projectId)
    console.log(asset, 'assetFromSuan')
    const lineChartData = createLineChartData([{
        //@ts-ignore
        periods: JSON.parse(projectPeriod),
        asset_name: projectTokenName
    }])
    const totalTokens = asset[0] ? parseInt(asset[0].quantity) : 0
    
    
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
        const actualProfitPercentage = actualPeriod && (actualPeriod.price * 100) / tokenHistoricalData[0].price || 0
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
        municipio: projectMunicipio,
        vereda: projectVereda,
        encodedCategory: encodeURIComponent(project.categoryID),
        tokenTotal: parseInt(actualPeriod?.amount),
        tokenUnits: parseInt(actualPeriod?.amount) - parseInt(totalTokensSold),
        tokenValue: actualPeriod?.price,
        tokenPercentageSold: ((parseInt(totalTokensSold) * 100 ) / totalAmountOfTokens).toFixed(1),
        tokenPercentageTokensOwn: (( totalTokens * 100 ) / totalAmountOfTokens).toFixed(1),
        totalAmountOfTokens,
        tokenCurrency: tokenCurrency,
    };
    
    let projectDuration = formatProjectDuration(projectData.projectInfo.token.lifeTimeProject)

    return {
        asset: asset[0],
        relevantInfo,
        totalAmountOfTokens,
        totalTokensSold,
        totalTokens,
        projectDuration,
        actualProfit,
        actualProfitPercentage,
        lineChartData
    }


}