import { MyPage } from '@suan//components/common/types';
import { WalletTransactions } from '@marketplaces/ui-lib';

const Transactions: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full px-5 pt-6">
        <div className="p-4 border-gray-200 rounded-lg dark:border-gray-700 mt-14 ">
          <WalletTransactions />
        </div>
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
