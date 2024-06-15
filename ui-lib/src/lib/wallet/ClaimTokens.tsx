import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

export default function ClaimTokens() {
  const [pendingTokensForClaiming, setPendingTokensForClaiming] = useState<any>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const { userId } = await getCurrentUser();

      const payload = {
        userId: userId,
      };

      const response = await fetch(
        'api/calls/backend/getPendingTokensForClaiming',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log('pendingTokensForClaiming', data);
      setPendingTokensForClaiming(data);
    };

    fetchData();
  }, []);

  const getTokens = async () => {
    // Función para solicitar tokens a endpoint de Luis
  };

  console.log('pendingTokensForClaiming', pendingTokensForClaiming);

  return (
    <>
      {pendingTokensForClaiming.length > 0 && (
        <div
          id="alert-additional-content-3"
          className="p-4 mb-5 space-y-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="flex-shrink-0 w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <h3 className="text-lg font-medium">Reclama tus tokens</h3>
          </div>
          <div className="text-sm">
            Tienes ordenes de compra de tokens pendiente por reclamar
          </div>
          <ul className="list-disc list-inside">
            {pendingTokensForClaiming &&
              pendingTokensForClaiming.map(
                (pendingOrder: any, index: number) => {
                  return (
                    <li key={index}>
                      Orden <strong>{pendingOrder.id}</strong> sin reclamar:{' '}
                      <strong>{pendingOrder.tokenName}</strong> x{' '}
                      <strong>{pendingOrder.tokenAmount}</strong>
                    </li>
                  );
                }
              )}
          </ul>
          <div className="flex">
            <button
              type="button"
              className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              <svg
                className="me-2 h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 14"
              >
                <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
              </svg>
              Reclamar Tokens
            </button>
          </div>
        </div>
      )}
    </>
  );
}
