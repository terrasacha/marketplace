import { useState, useEffect } from 'react';
import { coingeckoPrices } from '@marketplaces/data-access';

export default function DefaultCardClient(props: any) {
  const { title, value, subtitle, image, percentage } = props;

  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [rate, setRate] = useState<any>(null);

  useEffect(() => {
    if (value) {
      coingeckoPrices('cardano', value.currency).then((data) => setRate(data));
    }
  }, []);

  useEffect(() => {
    if (typeof rate === 'number') {
      ADApriceTotal(value).then((data: any) => setPortfolioValue(data));
    }
  }, [rate]);

  const ADApriceTotal = async (asset: any) => {
    console.log(asset, 'assetDefaultCardClient');
    try {
      const profit = asset.actualPeriod
        ? (parseFloat(asset.actualPeriod.price) / rate) * asset.quantity
        : (parseFloat(asset.periods[asset.periods.length - 1].price) / rate) *
          asset.quantity;

      return profit.toFixed(4);
    } catch (error) {
      console.error('Error fetching rate:', error);
      // Manejar el error aquí, ya sea lanzándolo nuevamente para que lo maneje un componente superior o retornando un valor predeterminado.
      return 'Error';
    }
  };

  const offset = `calc(3.14 * ${percentage})`;
  return (
    <div className="p-4 border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 bg-custom-fondo w-full flex items-center animate-fade animate-ease-in animate-duration-300 h-24">
      <div className="flex flex-col justify-start w-[80%]">
        <h4 className="text-sm font-semibold">{title || 'Title'}</h4>
        <p className="text-xs text-[#a7a7a7]">{subtitle || ' '}</p>
        <p className="text-xl font-bold">{`₳ ${portfolioValue}` || ''}</p>
      </div>
      <div className="w-[20%] flex justify-center items-center">
        {image && (
          <img src={`/images/icons/${image}.png`} className="max-h-10" />
        )}
        {percentage && (
          <div className="relative w-14 h-14">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 stroke-current"
                stroke-width="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              <circle
                className=" progress-ring__circle stroke-current text-custom-dark-hover"
                stroke-width="10"
                stroke-linecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke-dashoffset={`calc(3.14 * (-0.8 * ${percentage} + 128))`}
              ></circle>
              <text
                x="52"
                y="52"
                font-size="20"
                fontWeight={500}
                text-anchor="middle"
                alignment-baseline="middle"
              >
                {percentage}%
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
