// pages/dashboard/index.tsx
import { WalletDashboard } from '@marketplaces/ui-lib';
import { MyPage } from '@suan//components/common/types';
import { WalletSend } from '@marketplaces/ui-lib';

const Send: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <WalletSend userWalletData={props.userWalletData} />
      </div>
    </>
  );
};

export default Send;
Send.Layout = 'Main'; // Asigna el diseño principal (Main)

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
