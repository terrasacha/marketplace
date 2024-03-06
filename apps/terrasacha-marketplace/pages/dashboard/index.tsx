// pages/dashboard/index.tsx
import { DashboardInvestor } from '@marketplaces/ui-lib';
import { getTransactions } from '@terrasacha//backend';
import { MyPage } from '@terrasacha//components/common/types';

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
