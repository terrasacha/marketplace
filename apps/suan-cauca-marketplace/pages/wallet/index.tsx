// pages/dashboard/index.tsx
import WalletDashboard from '@marketplaces/ui-lib/src/lib/wallet/WalletDashboard';
import { MyPage } from '@cauca//components/common/types';
//import WalletDashboard from '@cauca//components/wallet/WalletDashboard';
import { getCurrentUser } from 'aws-amplify/auth';

const Wallet: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <WalletDashboard
          address={'sadadasdasdas'}
          img_url=""
          ada={1000}
          userWalletData={props.userWalletData}
        />
      </div>
    </>
  );
};

export default Wallet;
Wallet.Layout = 'Main'; // Asigna el diseño principal (Main)

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
