// pages/dashboard/index.tsx
import CoreWalletPage from '@marketplaces/ui-lib/src/lib/corewallet/CoreWalletPage';
import { WalletContext } from '@marketplaces/utils-2';
import { MyPage } from '@cauca//components/common/types';
import { useContext } from 'react';
//import WalletDashboard from '@cauca//components/wallet/WalletDashboard';

const CoreWallet: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <CoreWalletPage />
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
