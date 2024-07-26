import { MyPage } from '@cauca//components/common/types';
import WalletAssets from '@marketplaces/ui-lib/src/lib/wallet/WalletAssets';

const Assets: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <WalletAssets />
      </div>
    </>
  );
};

export default Assets;
Assets.Layout = 'Main'; // Asigna el diseño principal (Main)

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
