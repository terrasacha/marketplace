import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

interface ScriptRowProps {
  index: number;
  scriptName: string;
  pbk: string;
  testnetAddr: string;
  tokenName: string;
  policyId: string;
  projectID: string;
  script_type: string;
  handleOpenMintModal: (policyId: string) => void;
  handleDistributeTokens: (policyId: string) => void;
  handleDeleteScript: (policyId: string) => void;
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
    projectID,
    handleOpenMintModal,
    handleDistributeTokens,
    handleDeleteScript,
  } = props;

  const [isActionsActive, setIsActionsActive] = useState<boolean>(false);
  const dropdownRef = useRef<any>(null);

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
    <tr className="bg-custom-dark border-b-8 border-custom-fondo">
      <td className="px-6 py-4">
        <div className="relative" ref={dropdownRef}>
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
              <li>
                <button
                  className="flex w-full px-4 py-2 bg-red-600 text-white"
                  onClick={() => {
                    setIsActionsActive(false);
                    handleDeleteScript(policyId);
                  }}
                >
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </td>
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
  );
}
