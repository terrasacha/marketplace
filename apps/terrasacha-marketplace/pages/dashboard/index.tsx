// pages/dashboard/index.tsx
import { DashboardInvestor } from '@marketplaces/ui-lib';
import { getTransactions } from '@terrasacha/backend';
import { MyPage } from '@terrasacha/components/common/types';

const DashboardPage: MyPage = (props: any) => {
  const transactions = props.transactions;
  return (
    <>
      <div>
        <DashboardInvestor transactions={transactions} />
      </div>
    </>
  );
};

export async function getServerSideProps() {
  try {
    const transactions = await getTransactions();
    return {
      props: {
        transactions: transactions,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      props: {
        transactions: [], // Return an empty array or some default value in case of an error
      },
    };
  }
}

DashboardPage.Layout = 'Main'; // Asigna el diseño principal (Main)

export default DashboardPage;
