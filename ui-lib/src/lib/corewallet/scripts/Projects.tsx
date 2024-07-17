import { WalletContext } from '@marketplaces/utils-2';
import { getAllProjects } from '@marketplaces/data-access';
import ProjectItem from './ProjectItem';
import { useContext, useEffect, useState } from 'react';
import { Card } from '../../ui-lib';

export default function Projects(props: any) {
  const { walletID, walletAddress } = useContext<any>(WalletContext);
  const [projectList, setProjectList] = useState<any>(null);
  const [projectListFiltered, setProjectListFiltered] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('Distribuidos');

  async function fetchProjects() {
    const projects = await getAllProjects();
    console.log('projects', projects);
    setProjectList(projects);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectList) {
      if (activeTab === 'Distribuidos') {
        const projectsFiltered = projectList.filter(
          (project: any) => project.tokenGenesis === true
        );
        setProjectListFiltered(projectsFiltered);
      }
      if (activeTab === 'Sin distribuir') {
        const projectsFiltered = projectList.filter(
          (project: any) => project.tokenGenesis === false || project.tokenGenesis === null
        );
        setProjectListFiltered(projectsFiltered);
      }
    }
  }, [activeTab, projectList]);

  return (
    <>
      <Card className="h-fit">
        <Card.Header title="Gestión de Proyectos" />
        <Card.Body>
          <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-2">
            <li className="me-2">
              <button
                onClick={() => setActiveTab('Distribuidos')}
                className={`inline-block px-4 py-3 rounded-lg ${
                  activeTab === 'Distribuidos'
                    ? 'bg-custom-dark text-white'
                    : 'hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current="page"
              >
                Distribuidos
              </button>
            </li>
            <li className="me-2">
              <button
                onClick={() => setActiveTab('Sin distribuir')}
                className={`inline-block px-4 py-3 rounded-lg ${
                  activeTab === 'Sin distribuir'
                    ? 'bg-custom-dark text-white'
                    : 'hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Sin distribuir
              </button>
            </li>
          </ul>
          <div className="grid grid-cols-2 gap-2">
            {projectListFiltered && projectListFiltered.length > 0 ? (
              projectListFiltered.map((project: any) => (
                <ProjectItem project={project} key={project.id} fetchProjects={fetchProjects}/>
              ))
            ) : (
              <div className="flex col-span-2 items-center justify-center h-52">
                No se han encontrado proyectos pendientes por distribuir
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
