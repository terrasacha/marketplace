import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { CheckIcon } from '../ui-lib';

export default function PendingVerificationMessage() {
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      let userId = null;
      try {
        const { userId } = await getCurrentUser();
        setUser(userId);

        const response = await fetch(
          `/api/validations/validUser?userId=${userId}`
        );
        let userValidation = await response.json();

        // Si tiene cuenta ya cumplio la verificacion basica
        if (userId) {
          userValidation.isValidatedStep1 = true;
        }

        if (userValidation) {
          setVerificationStatus(userValidation);
        }
      } catch {
        setVerificationStatus({
          isValidatedStep1: false,
          isValidatedStep2: false,
        });
      }
    };

    fetchData();
  }, []);

  const renderVerificationLevels = () => {
    return (
      <div className="space-y-4">
        <div className="pl-4">
          <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 pl-2">
            <li className="mb-10 ms-6">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 ${
                  verificationStatus.isValidatedStep1
                    ? 'bg-green-200'
                    : 'bg-gray-100'
                }  rounded-full -start-4 ring-4 ring-white`}
              >
                {verificationStatus.isValidatedStep1 ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 5.917 5.724 10.5 15 1.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                  >
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                  </svg>
                )}
              </span>
              <h3 className="font-medium leading-tight">Verificación Basica</h3>
              <p className="text-sm">Correo electronico</p>
              {!verificationStatus.isValidatedStep1 && (
                <button
                  type="button"
                  className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 mt-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  onClick={() =>
                    window.open(
                      `https://identity.truora.com/preview/IPFe5575f69c6c12802870e66a8e5f6a94c?trigger_user=neider.smith1%40gmail.com&account_id=${user}`
                    )
                  }
                >
                  <CheckIcon className="h-3 w-3 me-2" />
                  Verificación Básica
                </button>
              )}
            </li>
            <li className="ms-6">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 ${
                  verificationStatus.isValidatedStep2
                    ? 'bg-green-200'
                    : 'bg-gray-100'
                }  rounded-full -start-4 ring-4 ring-white`}
              >
                {verificationStatus.isValidatedStep2 ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 5.917 5.724 10.5 15 1.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 16"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z" />
                  </svg>
                )}
              </span>
              <h3 className="font-medium leading-tight">Verificación Pro</h3>
              <p className="text-sm">Ubicación</p>
              <p className="text-sm">Teléfono</p>
              <p className="text-sm">Validación de documento</p>
              <p className="text-sm">Reconocimiento facial</p>
              {!verificationStatus.isValidatedStep2 && (
                <button
                  type="button"
                  className={`text-white disabled:opacity-50 bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 mt-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800`}
                  disabled={!verificationStatus.isValidatedStep1 && true}
                  onClick={() =>
                    window.open(
                      `https://identity.truora.com/preview/IPF428f73bc6dc1448d38eedac992d43f17?trigger_user=neider.smith1%40gmail.com&account_id=${user}`
                    )
                  }
                >
                  <CheckIcon className="h-3 w-3 me-2" />
                  Verificación Pro
                </button>
              )}
            </li>
          </ol>
        </div>
      </div>
    );
  };

  const renderVerificationDetails = () => {
    if (
      !verificationStatus.isValidatedStep1 ||
      !verificationStatus.isValidatedStep2
    ) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            ¡Verifica tu cuenta para realizar compras mediante FIAT!
          </h3>
          <div className="text-md">
            Para poder disfrutar de todas las ventajas de comprar con moneda
            FIAT en nuestro sitio, necesitamos que verifiques tu cuenta. Este
            sencillo paso nos ayuda a garantizar la seguridad y la protección de
            tus transacciones.
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {verificationStatus && (
        <>
          <div
            id="alert-additional-content-3"
            className="p-4 mb-5 space-y-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
            role="alert"
          >
            <div className="flex flex-col space-y-4">
              {renderVerificationDetails()}
              {renderVerificationLevels()}
            </div>
          </div>
        </>
      )}
    </>
  );
}
