import { useEffect, useState } from 'react';
import { useWallet, useAssets } from '@meshsdk/react';
import PieChartComponent from './PieChart';
import ItemsDashboard from './MainItemsDashboard';
import TransactionsTable from './TransactionsTable';
import DetailItems from './DetailItems';
import { Transactions } from '@marketplaces/ui-lib';

interface Transaction {
  amountOfTokens: number;
  tokenName: string;
  transactionDetails: [];
}

function Dashboard(props: { transactions: any[] }) {
  const { transactions } = props;
  const assets = useAssets() as Array<{ [key: string]: any }>;
  const { wallet, connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<string | undefined>(
    undefined
  );

  const newElements = transactions.filter(
    (transaction) => transaction.stakeAddress === walletStakeID
  );
  const groupedData = newElements.reduce((acc, item) => {
    const { tokenName, createdAt, amountOfTokens, product, ...rest } = item;

    if (!acc[tokenName]) {
      acc[tokenName] = {
        tokenName,
        transactionsDetail: [],
      };
    }

    acc[tokenName].transactionsDetail.push({
      createdAt,
      amountOfTokens,
      product,
      ...rest,
    });

    return acc;
  }, {});

  // Nuevo array con la información agrupada por nombre de token
  const otroArray = Object.values(groupedData);
  const FoundElement: Transaction[] = otroArray
    .map((foundElement: any) => {
      const matchingAsset =
        assets &&
        assets.find((asset) => {
          return asset.assetName === foundElement.tokenName;
        });

      if (matchingAsset) {
        const amountOfTokens = parseFloat(matchingAsset.quantity);
        return {
          amountOfTokens,
          tokenName: foundElement.tokenName,
          transactionDetails: foundElement.transactionsDetail,
        };
      }
      return {
        amountOfTokens: 0,
        tokenName: foundElement.tokenName,
        transactionDetails: foundElement.transactionsDetail,
      };
    })
    .filter(
      (element) =>
        element.amountOfTokens !== null && element.amountOfTokens !== 0
    );

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

  return (
    <div className="h-auto w-full px-5 pt-6">
      <div className="p-4 border-gray-200 rounded-lg">
        <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-gray-500">
          Tus Proyectos
        </h2>
        <div className="w-full">
          <h3 className="text-l font-semibold m-3 p-4 pb-2">
            Información general de tus proyectos
          </h3>
          <div className="flex flex-col md:flex-row">
            <ItemsDashboard NewElements={newElements} />
            <div className="dashboard-token bg-white dark:bg-[#69a1b3] shadow-lg rounded-mdp-3 border-b-4 border-white dark:border-[#588695] dark:text-gray-800">
              <div className="project_details p-4">
                <h4 className="text-l font-semibold">Tus Tokens SUAN</h4>
                <p className="text-[#6b7587] text-sm pr-2 m-0">
                  Estos son los proyectos que tienes hasta ahora
                </p>
                {FoundElement && (
                  <PieChartComponent foundElement={FoundElement} />
                )}
              </div>
            </div>
          </div>
          <h3 className="text-l font-semibold m-3 p-4 pb-2">
            Detalles de tus proyectos
          </h3>
          <div className="md:w-70 mt-4 mb-4 p-4 bg-white dark:bg-[#69a1b3] shadow-lg rounded-mdp-3 border-b-4 border-white dark:border-[#588695] dark:text-gray-800">
            <div className="project_details">
              {FoundElement && <DetailItems foundElement={FoundElement} />}
            </div>
          </div>
          <Transactions txPerPage={5} />
          {/* <div className="overflow-x-auto max-w-full">
            {newElements && <TransactionsTable NewElements={newElements} />}
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
