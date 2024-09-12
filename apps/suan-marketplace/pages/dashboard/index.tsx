// pages/dashboard/index.tsx
import DashboardInvestor from '@marketplaces/ui-lib/src/lib/dashboard/DashboardInvestor';
import { getTransactions } from '@suan//backend';
import { MyPage } from '@suan//components/common/types';

const DashboardPage: MyPage = (props: any) => {
  return (
    <>
      <div>
        <DashboardInvestor />
      </div>
    </>
  );
};

DashboardPage.Layout = 'Main'; // Asigna el diseño principal (Main)

export default DashboardPage;
