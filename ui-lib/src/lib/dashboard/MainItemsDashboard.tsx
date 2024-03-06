import { useState, useEffect } from 'react';
import DashboardItem from './DashboardItem';
import DashboardItemToggle from './DashboardItemToggle';
import { coingeckoPrices } from '@marketplaces/data-access';

interface ItemsDashboardProps {
  amountOfTokens: number;
  assets: Array<any>;
}

const ItemsDashboard: React.FC<ItemsDashboardProps> = ({
  amountOfTokens,
  assets,
}) => {
  const [profit, setProfit] = useState<number | object>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  useEffect(() => {
    sumProfits();
    ADApriceTotal(assets).then((data: any) => setPortfolioValue(data));
  }, [assets]);

  const sumProfits = () => {
    let sumCOP = 0;
    let sumUSD = 0;
    assets.forEach((item) => {
      if (item.currency === 'COP')
        sumCOP += item.diffBetweenFirsLastPeriod * item.quantity;
      else if (item.currency === 'USD')
        sumUSD += item.diffBetweenFirsLastPeriod * item.quantity;
    });
    setProfit({
      COP: sumCOP,
      USD: sumUSD,
    });
  };
  const ADApriceTotal = async (assets: Array<any>) => {
    let totalprice = 0;
    const COP = await coingeckoPrices('cardano', 'COP');
    const USD = await coingeckoPrices('cardano', 'USD');
    let rates: any = {
      COP,
      USD,
    };
    assets.map(async (item: any) => {
      item.ADAprice = item.actualPeriod
        ? (parseFloat(item.actualPeriod.price) / rates[item.currency]) *
          item.quantity
        : (parseFloat(item.periods[item.periods.length - 1].price) /
            rates[item.currency]) *
          item.quantity;
      totalprice += item.ADAprice;
    });
    return totalprice.toFixed(4);
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
        value={`₳ ${portfolioValue}`}
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
      <DashboardItemToggle
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
        values={profit}
        label="Aumento de valor"
      />
    </div>
  );
};

export default ItemsDashboard;
