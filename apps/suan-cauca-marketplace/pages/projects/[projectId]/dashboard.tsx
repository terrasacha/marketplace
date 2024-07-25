import { MyPage } from '@cauca//components/common/types';
import { getProject } from '@marketplaces/data-access';
import { mapProjectData } from '@cauca//lib/mappers';
import DashboardProject from '@marketplaces/ui-lib/src/lib/dashboard/dashboard-project/DashboardProject';

const DashboardPage: MyPage = (props: any) => {
  const { project, projectData, transactions, projectId } = props;
  return (
    <DashboardProject
      project={project}
      projectData={projectData}
      projectId={projectId}
    />
  );
};

export default DashboardPage;
DashboardPage.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { projectId } = context.params;

  const [project, projectData] = await Promise.all([
    getProject(projectId),
    getProject(projectId).then((projectData) => mapProjectData(projectData)),
  ]);

  return {
    props: {
      project,
      projectData,
      projectId,
    },
  };
}
