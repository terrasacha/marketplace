import { useContext, useEffect, useState } from 'react';
import { LoadingIcon, Modal } from '../../ui-lib';
import { WalletContext } from '@marketplaces/utils-2';

interface CreateScriptModalProps {
  handleOpenCreateScriptModal: () => void;
  createScriptModal: boolean;
}

export default function CreateScriptModal(props: CreateScriptModalProps) {
  const { walletID } = useContext<any>(WalletContext);
  const { handleOpenCreateScriptModal, createScriptModal } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateContract = async () => {
    setIsLoading(true);
    const payload = {
      script_type: 'mintSuanCO2',
      name: '',
      wallet_id: walletID,
      tokenName: '', // Opcional
      save_flag: '', // Opcional
      project_id: '', // Opcional
    };
    const response = await fetch('/api/transactions/account-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    console.log(responseData);
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
          Crear Contrato
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="block mb-2">
              Nombre del contrato
            </label>
            <input
              type="text"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              autoComplete="off"
              placeholder="Nombre del Contrato"
              required
            />
          </div>
          <div>
            <label className="block mb-2">
              Seleccione el tipo de contrato
            </label>
            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option disabled value=""></option>
              <option disabled value=""></option>
            </select>
          </div>
          <button
            type="button"
            className="col-span-4 sm:col-span-1 text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
            onClick={handleCreateContract}
          >
            {isLoading ? <LoadingIcon className="w-4 h-4" /> : 'Crear contrato'}
          </button>
        </Modal.Body>
      </Modal>
    </>
  );
}
