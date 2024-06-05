import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { convertAWSDatetimeToDate } from '@suan/lib/util';

interface ScriptRowProps {
  index: number;
  scriptName: string;
  pbk: string;
  testnetAddr: string;
  tokenName: string;
  policyId: string;
  projectID: string;
  active: boolean;
  tokenGenesis: boolean;
  script_type: string;
  createdAt: string;
  handleOpenMintModal: (policyId: string) => void;
  handleDistributeTokens: (policyId: string) => void;
  handleDeleteScript: (policyId: string) => Promise<boolean>;
  handleUpdateScript: (
    policyId: string,
    newStatus: boolean
  ) => Promise<boolean>;
  isChild?: boolean;
  childScripts?: any[];
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function ScriptRow(props: ScriptRowProps) {
  const {
    index,
    scriptName,
    pbk,
    testnetAddr,
    tokenName,
    policyId,
    script_type,
    createdAt,
    projectID,
    active,
    tokenGenesis,
    handleOpenMintModal,
    handleDistributeTokens,
    handleDeleteScript,
    handleUpdateScript,
    isChild = false,
    childScripts = [],
  } = props;

  const [isActionsActive, setIsActionsActive] = useState<boolean>(false);
  const [isChildVisible, setIsChildVisible] = useState<boolean>(false);
  const dropdownRef = useRef<any>(null);

  const deleteScript = async (policyID: string) => {
    Swal.fire({
      title: 'Estas seguro de eliminar este contrato?',
      text: 'No podrás revertir esta acción !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const contractDeleted = await handleDeleteScript(policyID);

        if (contractDeleted) {
          toast.success('Contrato eliminado exitosamente ...');
          Swal.fire({
            title: 'Contrato eliminado !',
            text: 'El contrato ha sido eliminado exitosamente.',
            icon: 'success',
          });
        } else {
          toast.error('Ha habido un error intentando eliminar el contrato ...');
        }
      }
    });
  };

  const updateScript = async (policyID: string) => {
    Swal.fire({
      title: 'Estas seguro de actualizar el estado de este contrato?',
      text: 'No podrás revertir esta acción !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar el estado!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const contractDeleted = await handleUpdateScript(policyID, !active);

        if (contractDeleted) {
          toast.success('Contrato actualizado exitosamente ...');
          Swal.fire({
            title: 'Estado actualizado !',
            text: 'El estado del contrato ha sido actualizado exitosamente.',
            icon: 'success',
          });
        } else {
          toast.error(
            'Ha habido un error intentando actualizar el contrato ...'
          );
        }
      }
    });
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsActionsActive(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      <tr
        className={`${
          !active ? 'bg-gray-400' : 'bg-custom-dark'
        } border-b-8 border-custom-fondo`}
      >
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            {childScripts.length > 0 && (
              <button
                id="dropdownDefaultButton"
                className="bg-custom-fondo text-black hover:bg-gray-100 focus:ring-1 focus:ring-gray-100 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center"
                type="button"
                onClick={() => setIsChildVisible(!isChildVisible)}
              >
                {isChildVisible ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" />
                )}
              </button>
            )}
            <div
              className={`${isChild && 'hidden'} relative`}
              ref={dropdownRef}
            >
              <button
                id="dropdownDefaultButton"
                className="bg-custom-fondo text-black hover:bg-gray-100 focus:ring-1 focus:ring-gray-100 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center"
                type="button"
                onClick={() => setIsActionsActive(!isActionsActive)}
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 3"
                >
                  <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                </svg>
              </button>
              <div
                id="dropdown"
                className={`z-10 ${
                  !isActionsActive && 'hidden'
                } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute mt-2`}
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {script_type === 'mintProjectToken' && active && (
                    <>
                      <li>
                        <button
                          className="flex w-full px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setIsActionsActive(false);
                            handleOpenMintModal(policyId);
                          }}
                        >
                          Quemar tokens
                        </button>
                      </li>
                      <li>
                        <button
                          className="flex w-full px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setIsActionsActive(false);
                            handleDistributeTokens(policyId);
                          }}
                        >
                          Distribuir tokens
                        </button>
                      </li>
                    </>
                  )}
                  <li>
                    <button
                      className={`flex w-full px-4 py-2 ${
                        active ? 'bg-red-600' : 'bg-green-600'
                      } text-white`}
                      onClick={() => {
                        setIsActionsActive(false);
                        updateScript(policyId);
                      }}
                    >
                      {active ? 'Desactivar' : 'Activar'}
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex w-full px-4 py-2 bg-red-600 text-white disabled:opacity-50`}
                      disabled={tokenGenesis ? true : false}
                      onClick={() => {
                        setIsActionsActive(false);
                        deleteScript(policyId);
                      }}
                    >
                      Eliminar
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">{convertAWSDatetimeToDate(createdAt)}</td>
        <td scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
          {scriptName}
        </td>
        <td className="px-6 py-4">{script_type}</td>
        <td className="px-6 py-4">{tokenName}</td>
        <td className="px-6 py-4">{projectID}</td>
        <td className="px-6 py-4">{policyId}</td>
        <td className="px-6 py-4">{pbk}</td>
        <td className="px-6 py-4">{testnetAddr}</td>
      </tr>
      {isChildVisible &&
        childScripts.map((childScript, childIndex) => (
          <ScriptRow
            key={`${index}-${childIndex}`}
            index={childIndex}
            policyId={childScript.id}
            projectID={childScript.productID}
            scriptName={childScript.name}
            pbk={childScript.pbk}
            script_type={childScript.script_type}
            createdAt={childScript.createdAt}
            testnetAddr={childScript.testnetAddr}
            tokenName={childScript.token_name}
            active={childScript.Active}
            handleOpenMintModal={handleOpenMintModal}
            handleDistributeTokens={handleDistributeTokens}
            handleDeleteScript={handleDeleteScript}
            handleUpdateScript={handleUpdateScript}
            isChild={true}
          />
        ))}
    </>
  );
}
