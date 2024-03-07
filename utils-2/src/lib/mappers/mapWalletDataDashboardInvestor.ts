import { getActualPeriod, mapTransactionListInfo} from "../utils-2"
import { coingeckoPrices } from '@marketplaces/data-access';

const getRates = async() => {
  const ADArateUSD = await coingeckoPrices("cardano", "USD")
  const ADArateCOP = await coingeckoPrices("cardano", "COP")

  return { ADArateCOP, ADArateUSD}
}
export async function mapWalletDataDashboardInvestor( walletData : any){

    const rates = await getRates()
    const assetFromSuan = walletData.assets.filter((asset : any)=> asset.policy_id === "8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83")
    const dataPieChart = assetFromSuan.map((asset : any) =>{ return { tokenName: asset.asset_name, amountOfTokens: parseInt(asset.quantity)}})
    const dataFromQuery = await fetch('/api/calls/getPeriodToken',{
        method: 'POST',
        body: JSON.stringify({
            assets_name: assetFromSuan.map((asset : any) => asset.asset_name)
        }),
    }
    )
    const data = await dataFromQuery.json()
    console.log(assetFromSuan,'assetFromSuan')
    assetFromSuan.forEach(async(item : any)=> {
      let match = data.find((item2 : any)=> item2.asset_name === item.asset_name);
      if (match){
        item.productID = match.productID
        item.currency = match.currency
        item.periods = JSON.parse(match.periods)
      };
      item.actualPeriod = getActualPeriod(Date.now(), item.periods);
      item.diffBetweenFirsLastPeriod = item.actualPeriod && item.actualPeriod.price - item.periods[0].price || 0
    });
    const lineChartData = createLineChartData(data , rates)
    const tokenQuantities   = assetFromSuan.map( (asset : any) => parseInt(asset.quantity))
    const amountOfTokens = tokenQuantities.reduce((total : number, current : number) => total + current, 0)
    const transacionsData = await getTransactionsData(walletData.stake_address, walletData.address)
    
    
    const valueUtxos = transacionsData.map((item : any) => parseFloat(item.tx_value.split(' ')[2]))

    return{
        assets: assetFromSuan,
        dataPieChart,
        lineChartData,
        amountOfTokens,
        transactions: {
          transacionsData
        },
        rates
    }
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

function createLineChartData(data: any, rates: any) {
  console.log(data,'createLineChartData')
  const convert1 = (price: number) => { return (price / rates.ADArateCOP) * rates.ADArateUSD} 
    const dataToPlot = data && data.map((item : any) => {
        let periods = JSON.parse(item.periods).map((p: any) => {
            let price = item.currency === 'COP'? convert1(p.price) : p.price
            return {
                period: parseInt(p.period),
                value: price, 
                date: p.date
            }
        })
        return {
            name: item.asset_name,
            data: periods,
            actualPeriod: getActualPeriod(Date.now(), periods)
        }
    }) || null
    const maxPeriod = dataToPlot ? dataToPlot.sort((a : any, b : any) => b.data.length - a.data.length)[0]?.data.length : 0
    return {
        dataToPlot,
        maxPeriod
    }
}