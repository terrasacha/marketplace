import { MyPage } from '@suan/components/common/types';
import { TradeCard } from '@marketplaces/ui-lib';

const Trade: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <TradeCard />
      </div>
    </>
  );
};

export default Trade;
Trade.Layout = 'Main'; // Asigna el diseño principal (Main)
