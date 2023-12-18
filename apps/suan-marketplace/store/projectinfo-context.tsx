import { createContext, useMemo, useState } from "react";

const ProjectInfoContext = createContext({});

export interface ProjectInfoInterface {
  projectID: string;
  projectDescription: string;
  projectName: string;
  projectFeatures: string[];
  tokenName: string;
  tokenCurrency: string;
  tokenPrice: string;
  availableAmount: string;
  createdAt: string;
  categoryID: string;
}

export function ProjectInfoContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfoInterface>({
    projectID: "",
    projectDescription: "",
    projectName: "",
    projectFeatures: [],
    tokenName: "",
    tokenCurrency: "",
    tokenPrice: "",
    availableAmount: "",
    createdAt: "",
    categoryID: ""
  });

  const handleProjectInfo = async (data: ProjectInfoInterface) => {
    setProjectInfo(data);
  };
  const contextProps = useMemo(
    () => ({ projectInfo, handleProjectInfo }),
    [projectInfo]
  );

  return (
    <ProjectInfoContext.Provider value={contextProps}>
      {children}
    </ProjectInfoContext.Provider>
  );
}

export default ProjectInfoContext;
