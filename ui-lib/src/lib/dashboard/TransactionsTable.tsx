import React from 'react';
import { getActualPeriod } from "@marketplaces/utils-2"
import TableRow from './TableRow';
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
    <div>
      <p>Historial de transacciones de billetera</p>
      <div className='w-[98%]'>
        <div className="flex space-x-2 items-center px-3 py-2 ">
          <div className="w-[220px] text-center">Nombre del proyecto</div>
          <div className="w-[220px] text-center">Hash transacción</div>
          <div className="w-[220px] text-center">Nombre Token</div>
          <div className="w-[220px] text-center">Fecha transacción</div>
          <div className="w-[220px] text-center">Tokens comprados</div>
          <div className="w-[220px] text-center">Valor transacción</div>
        </div>
        <div className="space-y-2">
        {sortedTransactions &&
          sortedTransactions.map(({
            tokenName,
            txHash,
            createdAt,
            amountOfTokens,
            product: { name, productFeatures },
          }, index : number) => {
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
              <TableRow
                key={index}
                index={index}
                name={name}
                txHash={txHash}
                tokenName={tokenName}
                formattedDate={formattedDate}
                amountOfTokens={amountOfTokens}
                actualPriceToken={actualPriceToken}
              />
            );
          })}
      </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
