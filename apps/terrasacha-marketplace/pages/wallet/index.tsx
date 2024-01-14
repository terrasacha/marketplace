// pages/dashboard/index.tsx
import { MyPage } from '@terrasacha/components/common/types';
import WalletDashboard from '@terrasacha/components/wallet/WalletDashboard';

const Wallet: MyPage = (props: any) => {
  return (
    <>
      <div>
        <WalletDashboard />
      </div>
    </>
  );
};

Wallet.Layout = 'Main'; // Asigna el diseño principal (Main)

export default Wallet;
