import React from 'react';
import { getActualPeriod } from '@suan/utils/generic/getActualPeriod';

interface Transaction {
  tokenName: string;
  txHash: string;
  createdAt: string;
  amountOfTokens: number;
  product: {
    name: string;
    productFeatures: {
      items: {
        value: number;
        featureID: string;
      }[];
    };
  };
}

interface TransactionsTableProps {
  NewElements: Transaction[];
}
const TransactionsTable: React.FC<TransactionsTableProps> = ({
  NewElements,
}) => {
  // Ordenar transacciones por fecha de forma descendente
  const sortedTransactions = NewElements.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="md:w-70 mt-4 p-4 bg-white dark:bg-[#69a1b3] shadow-lg rounded-mdp-3 border-b-4 border-white dark:border-[#588695] dark:text-gray-800">
      <h3 className="text-l font-semibold">
        Detalle de las transacciones realizadas
      </h3>
      <div className="overflow-x-auto max-w-full">
        <table className="w-full table-auto text-left text-sm font-light">
          <thead>
            <tr className="border-b font-medium dark:border-neutral-500 text-sm text-[#2E7D96] pr-2 font-semibold">
              <th scope="col" className="px-6 py-4">
                Nombre del proyecto
              </th>
              <th scope="col" className="px-6 py-4">
                Hash Transacción
              </th>
              <th scope="col" className="px-6 py-4">
                Nombre Token
              </th>
              <th scope="col" className="px-6 py-4">
                Fecha transacción
              </th>
              <th scope="col" className="px-6 py-4">
                Cantidad de tokens comprados
              </th>
              <th scope="col" className="px-6 py-4">
                Precio de transacción
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map(
              ({
                tokenName,
                txHash,
                createdAt,
                amountOfTokens,
                product: { name, productFeatures },
              }) => {
                const globalTokenPriceFeature = productFeatures.items.find(
                  (feature) => feature.featureID === 'GLOBAL_TOKEN_PRICE'
                );
                const date = new Date(createdAt);
                const formattedDate = `${date.getDate()} de ${date.toLocaleDateString(
                  'es',
                  { month: 'long' }
                )} de ${date.getFullYear()}`;
                const tokenHistoricalData = JSON.parse(
                  (
                    productFeatures.items.find(
                      (feature) =>
                        feature.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
                    )?.value || '[]'
                  ).toString()
                );
                const periods = tokenHistoricalData.map((tkhd: any) => {
                  return {
                    period: tkhd.period,
                    date: new Date(tkhd.date),
                    price: tkhd.price,
                    amount: tkhd.amount,
                  };
                });
                const actualPeriod = getActualPeriod(Date.now(), periods);
                const actualPriceToken = parseFloat(actualPeriod?.price);

                return (
                  <tr
                    className="text-sm text-[#6b7587] font-semibold"
                    key={txHash}
                  >
                    <td className="whitespace-nowrap px-6 py-4">{name}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <a
                        href={`https://preview.cardanoscan.io/transaction/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`${txHash.slice(0, 6)}...${txHash.slice(-6)}`}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{tokenName}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {formattedDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {amountOfTokens}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {actualPriceToken}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
