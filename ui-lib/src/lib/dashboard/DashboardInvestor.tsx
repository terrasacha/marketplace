import { use, useEffect, useState } from 'react';
import { useWallet, useAssets } from '@meshsdk/react';
import {
  ItemsDashboard,
  DetailItems,
  LineChartComponent,
  PieChartComponent,
} from '@marketplaces/ui-lib';
import { Card } from '../ui-lib';
import TransactionShort from './TransactionsShort';
import { mapTransactionListDashboard } from '@marketplaces/utils-2';
interface Transaction {
  amountOfTokens: number;
  tokenName: string;
  projectName: string;
  projectID: string;
}

function DashboardInvestor(props: { transactions: any[] }) {
  const { transactions } = props;
  const assets = useAssets() as Array<{ [key: string]: any }>;
  const { wallet, connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<string | undefined>(
    undefined
  );
  const [mappedTransactionList, setMappedTransactionList] = useState<any>(null);

  useEffect(() => {
    if (assets && walletStakeID) {
      mapTransactionListDashboard(transactions, walletStakeID, assets).then(
        (data) => setMappedTransactionList(data)
      );
    }
  }, [walletStakeID, assets]);

  useEffect(() => {
    async function loadWalletStakeID() {
      try {
        if (connected) {
          const addresses = await wallet.getRewardAddresses();
          if (addresses.length > 0) {
            const firstAddress = addresses[0];

            setWalletStakeID(firstAddress);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadWalletStakeID();
  }, [connected, wallet]);
  if (!mappedTransactionList) return <></>;
  return (
    <div className="h-auto w-full px-5 pt-6">
      <div className="p-4 border-gray-200 rounded-lg">
        <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-gray-500 mb-5">
          Tus Proyectos
        </h2>
        <div className="w-full flex flex-col col-span-3 space-y-5">
          <Card className="h-fit">
            <Card.Header title="Información general de tus proyectos" />
            <Card.Body>
              <div className="flex flex-col w-full">
                <ItemsDashboard NewElements={mappedTransactionList.inversion} />
              </div>
            </Card.Body>
          </Card>
          {/* BOX FOR GRAPHS */}
          <Card className="h-fit">
            <Card.Header title="Detalle de tus proyectos" />
            <Card.Body>
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-7 gap-4">
                <div className="relative bg-custom-dark-hover p-5 rounded-md shadow-xl lg:col-span-2 2xl:col-span-5 flex flex-col justify-center items-center max-h-96">
                  <h4 className="w-full text-[#ddd] text-md font-semibold">
                    Evolución del proyecto
                  </h4>
                  {mappedTransactionList && (
                    <LineChartComponent
                      lineChartData={mappedTransactionList.lineChartData}
                      plotVolume={false}
                    />
                  )}
                </div>
                <div className="relative bg-custom-dark-hover p-5 rounded-md shadow-xl lg:col-span-2 2xl:col-span-2 flex flex-col justify-center items-center max-h-96">
                  <h4 className="top-4 left-6 w-full text-[#ddd] text-md font-semibold">
                    Tokens de tu billetera
                  </h4>
                  {mappedTransactionList && (
                    <PieChartComponent
                      foundElement={mappedTransactionList.FoundElement}
                    />
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
          {mappedTransactionList && (
            <Card className="h-fit">
              <Card.Header title="Detalle de tokens adquiridos" />
              <Card.Body>
                <DetailItems
                  foundElement={mappedTransactionList.FoundElement}
                />
              </Card.Body>
            </Card>
          )}
          {mappedTransactionList && <TransactionShort txPerPage={8} />}
        </div>
      </div>
    </div>
  );
}

export default DashboardInvestor;
