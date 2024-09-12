import { useState, useEffect } from 'react';
import DashboardItem from './DashboardItem';
import DashboardItemToggle from './DashboardItemToggle';

interface ItemsDashboardProps {
  amountOfTokens: number;
  assets: Array<any>;
  rates: any;
}

export const ItemsDashboard: React.FC<ItemsDashboardProps> = ({
  amountOfTokens,
  assets,
  rates,
}) => {
  const [profit, setProfit] = useState<number | any>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  useEffect(() => {
    ADApriceTotal(assets).then((data: any) => setPortfolioValue(data));
  }, [assets]);

  const sumProfits = (COP: number, USD: number) => {
    let sumCOP = 0;
    let sumUSD = 0;
    assets.forEach((item) => {
      if (item.currency === 'COP')
        sumCOP += item.diffBetweenFirsLastPeriod * item.quantity;
      else if (item.currency === 'USD')
        sumUSD += item.diffBetweenFirsLastPeriod * item.quantity;
    });
    const totalProfit = ((sumCOP / COP) * USD + sumUSD).toFixed(4);
    setProfit({
      COP: sumCOP,
      USD: sumUSD,
      totalProfit,
    });
  };
  const ADApriceTotal = async (assets: Array<any>) => {
    let totalprice = 0;
    let ratesLocal: any = {
      COP: rates.ADArateCOP,
      USD: rates.ADArateUSD,
    };
    console.log(rates, 'rates');
    assets.map(async (item: any) => {
      item.ADAprice = item.actualPeriod
        ? (parseFloat(item.actualPeriod.price) / ratesLocal[item.currency]) *
          item.quantity
        : (parseFloat(item.periods[item.periods.length - 1].price) /
            ratesLocal[item.currency]) *
          item.quantity;
      totalprice += item.ADAprice;
    });
    sumProfits(ratesLocal.COP, ratesLocal.USD);
    return (totalprice * ratesLocal.USD).toFixed(4);
  };

  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
      <DashboardItem
        icon={
          <svg
            width="30"
            height="30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        }
        value={`${portfolioValue} USD`}
        label="Valor del portfolio"
      />
      <DashboardItem
        icon={
          <svg
            width="30"
            height="30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        }
        value={`${amountOfTokens}`}
        label="Tokens adquiridos"
      />
      <DashboardItem
        icon={
          <svg
            width="30"
            height="30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="stroke-current text-[#FFF] dark:text-white transform transition-transform duration-500 ease-in-out"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        }
        value={`${profit.totalProfit} USD`}
        label="Aumento de valor"
      />
    </div>
  );
};

export default ItemsDashboard;
