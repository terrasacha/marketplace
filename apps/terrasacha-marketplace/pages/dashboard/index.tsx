// pages/dashboard/index.tsx
import Dashboard from '../../components/dashboard/Dashboard';
import { getTransactions } from '@marketplaces/data-access';
import { MyPage } from '../../components/common/types';

const DashboardPage: MyPage = (props: any) => {
  const transactions = props.transactions;
  return (
    <>
      <div>
        <Dashboard transactions={transactions} />
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
