import { createContext, useEffect, useMemo, useState } from 'react';
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
  const [walletBySuan, setWalletBySuan] = useState<boolean>(false);
  const [walletAdmin, setWalletAdmin] = useState<boolean>(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [lastSyncDate, setLastSyncDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [prevBalance, setPrevBalance] = useState(null);
  const [balanceChanged, setBalanceChanged] = useState(0);

  const handleWalletData = async ({
    walletID,
    walletName,
    walletAddress,
    isWalletBySuan = false,
    isWalletAdmin = false,
  }: any) => {
    if (walletAddress) {
      setWalletID(walletID);
      setWalletName(walletName);
      setWalletAddress(walletAddress);
      setWalletBySuan(isWalletBySuan);
      setWalletAdmin(isWalletAdmin);
      const updatedWalletData = await fetchWalletData(walletAddress);
      setWalletStakeAddress(updatedWalletData.stake_address);
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
      return updatedWalletData;
    }
    return null;
  };

  const handleClearData = () => {
    setWalletID(null);
    setWalletName(null);
    setWalletData(null);
    setWalletAddress(null);
    setWalletStakeAddress(null);
  };

  const fetchWalletData = async (wAddress: string | null = null) => {
    setIsLoading(true);
    console.log('fetch wallet data');
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

      if (prevBalance === null) {
        setPrevBalance(responseData[0].balance);
      }

      setWalletData(responseData[0]);
      setIsLoading(false);
      setLastSyncDate(Date.now());

      return responseData[0];
    }
    setIsLoading(false);
    setWalletData(null);
    return null;
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const walletData = await fetchWalletData();

      if (walletData) {
        const newBalance = walletData.balance;
        console.log('prevBalance', prevBalance);
        console.log('newBalance', newBalance);
        console.log('walletDataUpdate', walletData);
        if (prevBalance !== newBalance && prevBalance !== null) {
          setBalanceChanged(newBalance - prevBalance);

          /* const sound = new Howl({
            src: ['path/to/your/sound/file.mp3'],
          });
          sound.play(); */

          setTimeout(() => {
            setBalanceChanged(0);
          }, 2000);
        }
        setPrevBalance(newBalance);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchWalletData]);

  const connected = () => {
    if (walletData) {
      return true;
    } else {
      return false;
    }
  };

  const contextProps = useMemo(
    () => ({
      walletID,
      walletName,
      walletAddress,
      walletStakeAddress,
      walletBySuan,
      walletAdmin,
      walletData,
      isLoading,
      lastSyncDate,
      balanceChanged,
      handleWalletData,
      handleClearData,
      fetchWalletData,
      connected,
    }),
    [walletData]
  );

  return (
    <WalletContext.Provider value={contextProps}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletContext;
