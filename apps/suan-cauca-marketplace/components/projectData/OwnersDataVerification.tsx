import { useState } from "react";

export default function OwnersDataVerification({
  projectID,
  projectOwnersData,
  renderFileLinkByDocumentID,
}: any) {
  let data = projectOwnersData;
  const [showVerificationResult, setShowVerificationResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleValidation = async () => {
    setIsLoading(true);
    setShowVerificationResult(false);
    if (data) {
      // Si existe al menos un titular ...
      const mapOwnersId = data.map((obj: any) => {
        return {
          docNumber: obj.docNumber,
        };
      });

      const payload = {
        operation: "verify",
        payload: {
          projectId: projectID,
          OwnersId: mapOwnersId,
        },
      };

      const requestOptions = {
        method: "POST", // Método de solicitud
        headers: {
          "Content-Type": "application/json", // Tipo de contenido del cuerpo de la solicitud
        },
        body: JSON.stringify(payload), // Datos que se enviarán en el cuerpo de la solicitud
      };

      const response: any = await fetch(
        "/api/calls/verifyOwners",
        requestOptions
      );
      const ownersValidation = await response.json();
      console.log("response", ownersValidation);
      if (ownersValidation.message[0] === true) {
        setVerificationResult((prevState: any) => ({
          candidateHash: ownersValidation.message[1].candidateHash,
          digestCalcHash: ownersValidation.message[1].digestCalcHash,
          digestHash: ownersValidation.message[1].digestHash,
          docHash: ownersValidation.message[1].docHash,
        }));
      }
      setShowVerificationResult(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Titulares
        </h5>
      </div>
      <div className="flow-root">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3">
                  Tipo de identificación
                </th>
                <th scope="col" className="px-6 py-3">
                  Numero de identificación
                </th>
                <th scope="col" className="px-6 py-3">
                  Certificado de tradición
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((obj: any, index: number) => {
                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={index}
                  >
                    <td className="px-6 py-4">{obj.name}</td>
                    <td className="px-6 py-4">{obj.docType.toUpperCase()}</td>
                    <td className="px-6 py-4">{obj.docNumber}</td>
                    <td className="px-6 py-4">
                      {renderFileLinkByDocumentID(obj.documentID)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projectOwnersData.length > 0 && (
          <button
            type="button"
            className="mt-3 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => handleValidation()}
          >
            {isLoading ? (
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 me-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              "Validar en Blockchain"
            )}
          </button>
        )}
        {showVerificationResult && (
          <div
            id="alert-additional-content-5"
            className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 w-4 h-4 me-2 dark:text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">
                Resultado de verificación en Blockchain
              </h3>
            </div>
            <div className="mt-2 mb-4 text-sm text-gray-800 dark:text-gray-300">
              {verificationResult ? (
                <ul className="mt-1.5 ml-2 list-disc list-inside">
                  <li>candidateHash: {verificationResult.candidateHash}</li>
                  <li>digestCalcHash: {verificationResult.digestCalcHash}</li>
                  <li>digestHash: {verificationResult.digestHash}</li>
                  <li>docHash: {verificationResult.docHash}</li>
                </ul>
              ) : (
                <p>Hashes no coinciden</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
