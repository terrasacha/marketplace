import { useContext, useEffect, useState } from 'react';
import { LoadingIcon, Modal } from '../../ui-lib';
import { WalletContext } from '@marketplaces/utils-2';
import { toast } from 'sonner';

interface CreateScriptModalProps {
  handleOpenCreateScriptModal: () => void;
  getCoreWalletData: () => void;
  createScriptModal: boolean;
}
interface NewContractProps {
  scriptName: string;
  scriptType: string;
  tokenName: string;
  saveFlag: boolean;
  projectId: string;
}

export default function CreateScriptModal(props: CreateScriptModalProps) {
  const { walletID } = useContext<any>(WalletContext);
  const { handleOpenCreateScriptModal, getCoreWalletData, createScriptModal } =
    props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [newContract, setNewContract] = useState<NewContractProps>({
    scriptName: '',
    scriptType: '',
    tokenName: '',
    saveFlag: true,
    projectId: '',
  });

  const handleSetNewContract = (key: string, value: string | boolean) => {
    let parsedValue = value;

    setNewContract((prevState: any) => {
      return {
        ...prevState,
        [key]: parsedValue,
      };
    });
  };

  const validateFields = () => {
    if (
      newContract.scriptName.trim() === '' ||
      newContract.scriptType.trim() === '' ||
      (newContract.scriptType.startsWith('mint') &&
        newContract.tokenName.trim() === '')
    ) {
      toast.warning('Complete los campos oblgiatorios poder continuar ...');
      return false;
    }
    return true;
  };

  const handleCreateContract = async () => {
    if (!validateFields()) {
      return;
    }
    setIsLoading(true);
    const payload = {
      script_type: newContract.scriptType,
      name: newContract.scriptName,
      wallet_id: walletID,
      tokenName: newContract.tokenName, // Opcional
      save_flag: newContract.saveFlag, // Opcional
      project_id: newContract.projectId, // Opcional
    };
    console.log(payload);
    const response = await fetch('/api/contracts/create-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    if (responseData?.success) {
      toast.success('Se ha creado el contrato exitosamente ...')
      await getCoreWalletData();
      handleOpenCreateScriptModal();
    } else {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Modal show={createScriptModal} size="6xl">
        <Modal.Header
          onClose={() => {
            handleOpenCreateScriptModal();
          }}
        >
          Creación de contrato
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="block mb-2">
              Nombre del contrato<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              autoComplete="off"
              placeholder="Nombre del contrato"
              required
              value={newContract.scriptName}
              onInput={(e) =>
                handleSetNewContract('scriptName', e.currentTarget.value)
              }
            />
          </div>
          <div>
            <label className="block mb-2">
              Seleccione el tipo de contrato
              <span className="text-red-600">*</span>
            </label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) =>
                handleSetNewContract('scriptType', e.target.value)
              }
              value={newContract.scriptType}
            >
              <option disabled value="">
                Selecciona una opción ...
              </option>
              <option value="native">native</option>
              <option value="mintSuanCO2">mintSuanCO2</option>
              <option value="mintProjectToken">mintProjectToken</option>
              <option value="spend">spend</option>
              <option value="any">any</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">
              Nombre del token
              {newContract.scriptType.startsWith('mint') && (
                <span className="text-red-600">*</span>
              )}
            </label>
            <input
              type="text"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              autoComplete="off"
              placeholder="Nombre del token"
              required
              value={newContract.tokenName}
              onInput={(e) =>
                handleSetNewContract('tokenName', e.currentTarget.value)
              }
            />
          </div>
          <div>
            <label className="block mb-2">ID de proyecto</label>
            <input
              type="text"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              autoComplete="off"
              placeholder="Id de proyecto"
              required
              value={newContract.projectId}
              onInput={(e) =>
                handleSetNewContract('projectId', e.currentTarget.value)
              }
            />
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={newContract.saveFlag}
                onChange={(e) =>
                  handleSetNewContract('saveFlag', !newContract.saveFlag)
                }
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm">Guardar en base de datos</span>
            </label>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="col-span-4 sm:col-span-1 text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
              onClick={handleCreateContract}
            >
              {isLoading ? (
                <LoadingIcon className="w-4 h-4" />
              ) : (
                'Crear contrato'
              )}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
