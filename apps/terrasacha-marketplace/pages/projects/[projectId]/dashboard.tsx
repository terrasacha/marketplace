import { MyPage } from '@terrasacha//components/common/types';
import {
  getProject,
  getProjectData,
} from '@marketplaces/data-access';
import { mapProjectData } from '@terrasacha//lib/mappers';
import { DashboardProject } from "@marketplaces/ui-lib"

const DashboardPage: MyPage = (props : any) => {
  const project = props.project;
  const projectData = props.projectData;

  return (
    <DashboardProject project={project} projectData={projectData}/>
  )
};

export default DashboardPage;
DashboardPage.Layout = 'Main';


export async function getServerSideProps(context: any) {
    const { projectId } = context.params;
  
    const project = await getProject(projectId);
    const projectData = await getProjectData(projectId);
    const mappedProjectdata = await mapProjectData(projectData);
    // token propios  /api/v1/wallet/account-utxo/
    return {
      props: {
        project: project,
        projectData: mappedProjectdata,
      },
    };
} 