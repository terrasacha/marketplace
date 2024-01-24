// pages/dashboard/index.tsx
import { Account } from '@marketplaces/ui-lib';
import { MyPage } from '@suan//components/common/types';
import WalletDashboard from '@suan//components/wallet/WalletDashboard';

const Wallet: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full px-5 pt-6">
        <div className="p-4 border-gray-200 rounded-lg dark:border-gray-700 mt-14 ">
          <Account address={'sadadasdasdas'} img_url="" ada={1000} />
        </div>
      </div>
    </>
  );
};

Wallet.Layout = 'Main'; // Asigna el diseño principal (Main)

export default Wallet;
