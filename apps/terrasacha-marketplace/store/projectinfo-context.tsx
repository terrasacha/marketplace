import { createContext, useMemo, useState } from 'react';

const ProjectInfoContext = createContext({});

export interface ProjectInfoInterface {
  projectID: string;
  projectDescription: string;
  projectName: string;
  projectFeatures: string[];
  token: any;
  tokenCurrency: string;
  tokenPrice: string;
  availableAmount: string;
  scripts: Array<any>;
  createdAt: string;
  categoryID: string;
}

export function ProjectInfoContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfoInterface>({
    projectID: '',
    projectDescription: '',
    projectName: '',
    projectFeatures: [],
    token: {},
    tokenCurrency: '',
    tokenPrice: '',
    availableAmount: '',
    scripts: [],
    createdAt: '',
    categoryID: '',
  });

  const handleProjectInfo = async (data: ProjectInfoInterface) => {
    setProjectInfo((prevData) => {
      return {
        ...prevData,
        ...data,
      };
    });
  };
  const contextProps = { projectInfo, handleProjectInfo };

  return (
    <ProjectInfoContext.Provider value={contextProps}>
      {children}
    </ProjectInfoContext.Provider>
  );
}

export default ProjectInfoContext;
