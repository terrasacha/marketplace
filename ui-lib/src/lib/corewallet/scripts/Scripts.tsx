import { useRouter } from 'next/router';
import { Card, PlusIcon } from '../../ui-lib';
import ScriptsList from './ScriptsList';
import { useEffect, useState } from 'react';
import CreateScriptModal from './CreateScriptModal';
import MintModal from './MintModal';

export default function Scripts(props: any) {
  const [scripts, setScripts] = useState<Array<any>>([]);
  const [createScriptModal, setCreateScriptModal] = useState<boolean>(false);
  const [mintModal, setMintModal] = useState<boolean>(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const getCoreWalletData = async () => {
    const request = await fetch('/api/contracts/get-scripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await request.json();
    console.log(responseData);

    setScripts(responseData.data);
  };

  useEffect(() => {
    getCoreWalletData();
  }, []);

  const handleOpenCreateScriptModal = () => {
    setCreateScriptModal(!createScriptModal);
  };
  const handleOpenMintModal = (policyId: string | null = null) => {
    setSelectedScript(policyId);
    setMintModal(!mintModal);
  };

  return (
    <>
      <Card>
        <Card.Header
          title="Scripts"
          tooltip={
            <button
              type="button"
              className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
              onClick={handleOpenCreateScriptModal}
            >
              <PlusIcon />
            </button>
          }
        />

        <Card.Body>
          <ScriptsList
            scripts={scripts}
            itemsPerPage={5}
            handleOpenMintModal={handleOpenMintModal}
          />
        </Card.Body>
      </Card>
      <CreateScriptModal
        createScriptModal={createScriptModal}
        handleOpenCreateScriptModal={handleOpenCreateScriptModal}
        getCoreWalletData={getCoreWalletData}
      />
      <MintModal
        mintModal={mintModal}
        scripts={scripts}
        selectedScript={selectedScript}
        handleOpenMintModal={handleOpenMintModal}
      />
    </>
  );
}
