import { MyPage } from '../../../components/common/types';
import { getProperty } from '@marketplaces/data-access';
import { mapPropertyData } from '../../../lib/mappers';
import DashboardProperty from '@marketplaces/ui-lib/src/lib/dashboard/dashboard-property/DashboardProperty';

const DashboardPage: MyPage = (props: any) => {
  const { property, propertyData, propertyId } = props;
  return (
    <DashboardProperty
      property={property}
      propertyData={propertyData}
      propertyId={propertyId}
    />
  );
};

export default DashboardPage;
DashboardPage.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { propertyId } = context.params;

  const [property, propertyData] = await Promise.all([
    getProperty(propertyId),
    getProperty(propertyId).then((projectData) => mapPropertyData(projectData)),
  ]);

  return {
    props: {
      property,
      propertyData,
      propertyId,
    },
  };
}
