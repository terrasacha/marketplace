// pages/dashboard/index.tsx
import { MyPage } from '@suan//components/common/types';
import WalletSend from '@marketplaces/ui-lib/src/lib/wallet/WalletSend';
import Achievements from '@marketplaces/ui-lib/src/lib/wallet/achievements/Achievements'
const Send: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <Achievements userWalletData={props.userWalletData} />
      </div>
    </>
  );
};

export default Send;
Send.Layout = 'Main';

export async function getServerSideProps(context: any) {
  return {
    props: {
      userWalletData: {
        address: '',
        amount: '',
      },
    },
  };
}
