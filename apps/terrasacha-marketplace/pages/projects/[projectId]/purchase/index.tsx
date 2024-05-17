import React, { useEffect, useContext } from 'react';
import { getImagesCategories, getProject } from '@terrasacha/backend';
import PaymentPage from '@terrasacha/components/payments/PaymentPage';
import ProjectInfoContext from '@terrasacha/store/projectinfo-context';
import { MyPage } from '@terrasacha/components/common/types';
import { getActualPeriod } from '@terrasacha/utils/generic/getActualPeriod';
import { PageHeader } from '@marketplaces/ui-lib';

const PurchasePage: MyPage = (props: any) => {
  const { project, image } = props;

  const { handleProjectInfo } = useContext<any>(ProjectInfoContext);

  useEffect(() => {
    if (typeof project === 'object') {
      const tokenCurrency: string =
        project.productFeatures.items.filter((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
        })[0]?.value || '';
      const tokenHistoricalData = JSON.parse(
        project.productFeatures.items.filter((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
        })[0]?.value || '[]'
      );
      const periods = tokenHistoricalData.map((tkhd: any) => {
        return {
          period: tkhd.period,
          date: new Date(tkhd.date),
          price: tkhd.price,
          amount: tkhd.amount,
        };
      });

      const actualPeriod: any = getActualPeriod(Date.now(), periods);
      const totalProjectTokens = periods.reduce(
        (sum: number, item: any) => sum + parseInt(item.amount),
        0
      );
      const totalTokensSold = project.transactions.items.reduce(
        (acc: any, item: any) => {
          return acc + item.amountOfTokens;
        },
        0
      );

      const totalTokensFromFirstToActualPeriod: number =
        tokenHistoricalData.reduce((acc: any, hd: any) => {
          if (parseInt(hd.period) <= parseInt(actualPeriod.period)) {
            return acc + hd.amount;
          } else {
            return acc;
          }
        }, 0);

      const tokenUnits: number = totalProjectTokens - parseInt(totalTokensSold);

      const projectInfo = {
        projectID: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectFeatures: project.productFeatures.items,
        tokenName: project.token.tokenName,
        tokenCurrency: tokenCurrency,
        tokenPrice: actualPeriod?.price,
        availableAmount: tokenUnits,
        categoryID: project.categoryID,
        token: project.tokens.items[0],
        createdAt: new Date(project.createdAt).toLocaleDateString('es-ES'),
      };
      handleProjectInfo(projectInfo);
    }
  }, [project]);

  return (
    <>
      <div className="h-auto w-full p-5">
        <PageHeader></PageHeader>
        <PaymentPage></PaymentPage>
      </div>
      {/* <Modal
        show={openModal === "newPaymentMethodModal"}
        onClose={() => setOpenModal(undefined)}
        size="xl"
      >
        <Modal.Header>Add new payment method</Modal.Header>
        <Modal.Body>
          <AddNewPaymentMethodForm addNewPaymentMethod={addNewPaymentMethod} />
        </Modal.Body>
      </Modal> */}
    </>
  );
};

export default PurchasePage;
PurchasePage.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { projectId } = context.params;
  const project = await getProject(projectId);
  const image = await getImagesCategories(
    encodeURIComponent(`${project.categoryID}_banner`)
  );

  return {
    props: {
      project: project,
      image: image,
    },
  };
}
