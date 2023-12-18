import { createContext, useState } from 'react';

const ModalContext = createContext({});


export function ModalContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [component, setComponent] = useState<any>()
  const [projectInfo, setProjectInfo] = useState<any>()

  const handleShowModal = async (component: any, props = {}) => {
  };
  const handleHideModal = async () => {
  };

  const contextProps = {
    showModal: handleShowModal,
    hideModal: handleHideModal
  };
  return (
    <ModalContext.Provider value={contextProps}>
      {children}
    </ModalContext.Provider>
  );


}