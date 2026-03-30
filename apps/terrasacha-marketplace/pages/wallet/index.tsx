// pages/dashboard/index.tsx
import WalletDashboard from '@marketplaces/ui-lib/src/lib/wallet/WalletDashboard';
import { MyPage } from '@suan//components/common/types';
//import WalletDashboard from '@suan//components/wallet/WalletDashboard';
import { getCurrentUser } from 'aws-amplify/auth';

const Wallet: MyPage = (props: any) => {
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-custom-marca-boton-alterno2/5">
      <div className="w-full p-5 lg:p-8">
        <WalletDashboard
          address={'sadadasdasdas'}
          img_url=""
          ada={1000}
          userWalletData={props.userWalletData}
        />
      </div>
    </div>
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
