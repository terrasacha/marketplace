// pages/dashboard/index.tsx
import { WalletContext } from '@marketplaces/utils-2';
import { MyPage } from '@suan//components/common/types';
import { useContext } from 'react';
//import WalletDashboard from '@suan//components/wallet/WalletDashboard';

const CoreWallet: MyPage = (props: any) => {
  const { walletAdmin, walletBySuan } = useContext<any>(WalletContext);

  console.log('walletAdmin', walletAdmin)
  console.log('walletBySuan', walletBySuan)
  return (
    <>
      <div className="h-auto w-full p-5">
        <p>Core Wallet</p>
      </div>
    </>
  );
};

export default CoreWallet;
CoreWallet.Layout = 'Main'; // Asigna el diseño principal (Main)

export async function getServerSideProps(context: any) {
  // const user = await getCurrentUser();

  // const userWalletData = await getUserWalletData(projectData);
  return {
    props: {
      userWalletData: {
        address: '',
        amount: '',
      },
    },
  };
}
