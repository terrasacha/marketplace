import { useEffect, useState } from "react";
import { useWallet, useAssets } from "@meshsdk/react";
import { ItemsDashboard, TransactionsTable, DetailItems, LineChartComponent, PieChartComponent } from '@marketplaces/ui-lib'

interface Transaction {
  amountOfTokens: number;
  tokenName: string;
  transactionDetails: [];
}

function DashboardInvestor(props: { transactions: any[] }) {
  const { transactions } = props;
  const assets = useAssets() as Array<{ [key: string]: any }>;
  const { wallet, connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<string | undefined>(undefined);

  const newElements = transactions.filter(transaction => transaction.stakeAddress === walletStakeID);
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
  const FoundElement: Transaction[] = otroArray.map((foundElement: any) => {
    const matchingAsset = assets && assets.find(asset => {
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
  }).filter(element => element.amountOfTokens !== null && element.amountOfTokens !== 0);

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
        
          <h3 className="font-semibold my-3 pl-2 pb-2 text-xl">Información general de tus proyectos</h3>
          <div className="flex flex-col w-full">
            <ItemsDashboard NewElements={newElements} />
            {/* <div className="bg-white dark:bg-[#69a1b3] shadow-lg rounded-mdp-3 border-b-4 border-white dark:border-[#588695] dark:text-gray-800">
              <div className="project_details p-4">
                {FoundElement && <PieChartComponent foundElement={FoundElement} />}
              </div>
            </div> */}
          </div>
          <h3 className="font-semibold my-3 pl-2 pb-2 text-xl">Detalles de tus proyectos</h3>

          {/* BOX FOR GRAPHS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-7 gap-4">
            <div className="relative bg-custom-dark-hover p-4 rounded-md shadow-lg lg:col-span-2 2xl:col-span-5 flex flex-col justify-center items-center">
              <h4 className="w-full text-[#ddd] text-md font-semibold">Evolución del proyecto</h4>
              <LineChartComponent />
            </div>            
            <div className="relative bg-custom-dark-hover p-4 rounded-md shadow-lg lg:col-span-2 2xl:col-span-2 flex flex-col justify-center items-center">
            <h4 className="absolute top-4 left-6 w-full text-[#ddd] text-md font-semibold">Tokens de tu billetera</h4>
            
            <PieChartComponent />
            </div>
          </div>
          <div className="overflow-x-auto max-w-full">
              {FoundElement && <DetailItems foundElement={FoundElement} />}
            {newElements && <TransactionsTable NewElements={newElements} />}
          </div>
        </div>
      </div>
    </div>

  );
}

export default DashboardInvestor;
