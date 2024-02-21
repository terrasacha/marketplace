import { createContext, useMemo, useState } from 'react';
import { getProjects } from '@marketplaces/data-access';
import { getActualPeriod } from '../utils-2';

const WalletContext = createContext({});

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletID, setWalletID] = useState<any>(null);
  const [walletName, setWalletName] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<any>(null);
  const [walletStakeAddress, setWalletStakeAddress] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);

  const handleWalletData = async (data: any) => {
    if (data) {
      console.log('GetUserWallet', data);
      setWalletID(data[0].id);
      setWalletName(data[0].name);
      setWalletAddress(data[0].address);
      setWalletStakeAddress(data[0].stake_address);
      const updatedWalletData = await fetchWalletData(data[0].address);
      const projectsData = await getProjects();

      const mappedAssetsPrice = await Promise.all(
        projectsData.map(async (project: any) => {
          const tokenHistoricalData = JSON.parse(
            project.productFeatures.items.filter((item: any) => {
              return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
            })[0]?.value || '[]'
          );

          const periods = tokenHistoricalData.map((tkhd: any) => {
            return {
              period: tkhd.period,
              date: new Date(tkhd.date),
              price: tkhd.price,
              amount: tkhd.amount,
            };
          });

          const actualPeriod = await getActualPeriod(Date.now(), periods);

          const tokenCurrency =
            project.productFeatures.items.filter((item: any) => {
              return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
            })[0]?.value || '';

          const tokenName =
            project.productFeatures.items.filter((item: any) => {
              return item.featureID === 'GLOBAL_TOKEN_NAME';
            })[0]?.value || '';

          const tokenPrice = actualPeriod?.price;

          return {
            tokenName: tokenName,
            tokenPrice: tokenPrice,
            tokenCurrency: tokenCurrency,
          };
        })
      );
      console.log('mappedAssetsPrice', mappedAssetsPrice);
      // const updatedAssetsPrice = updatedWalletData.assetes.map(
      //   async (asset: any, index: number) => {
      //     // Listar todos los tokens de todos los proyectos y su precio actual

      //     return asset;
      //   }
      // );
      console.log(updatedWalletData, 'UpdatedWalletData');

      setWalletData(updatedWalletData);
      return updatedWalletData;
    }
    return null;
  };

  const handleClearData = () => {
    setWalletID(null);
    setWalletName(null);
    setWalletData(null);
  };

  const fetchWalletData = async (wAddress: string | null = null) => {
    const wallet_address = walletAddress || wAddress;
    if (wallet_address) {
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wallet_address),
        }
      );
      const responseData = await response.json();

      return responseData[0];
    }
    return null;
  };

  const connected = () => {
    if (walletData) {
      return true;
    } else {
      return false;
    }
  };

  const contextProps = useMemo(
    () => ({ walletID, walletName, walletAddress, walletStakeAddress, walletData, handleWalletData, connected }),
    [walletData]
  );

  return (
    <WalletContext.Provider value={contextProps}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletContext;
