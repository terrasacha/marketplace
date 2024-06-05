import { MyPage } from '@suan//components/common/types';
import WalletTransactions  from '@marketplaces/ui-lib/src/lib/wallet/WalletTransactions';

const Transactions: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <WalletTransactions />
      </div>
    </>
  );
};

export default Transactions;
Transactions.Layout = 'Main'; // Asigna el diseño principal (Main)

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
