import { createContext, useMemo, useState } from 'react';

const SuanWalletContext = createContext({});

// export interface ProjectInfoInterface {
//   projectID: string;
//   projectDescription: string;
//   projectName: string;
//   projectFeatures: string[];
//   tokenName: string;
//   tokenCurrency: string;
//   tokenPrice: string;
//   availableAmount: string;
//   createdAt: string;
//   categoryID: string;
// }

export function SuanWalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletData, setWalletData] = useState<any>(null);

  const handleWalletData = async (data: any) => {
    if (data) {
      const walletIDs = data.map((wallet: any) => {
        return wallet.address;
      });
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(walletIDs),
          // body: JSON.stringify([
          //   'addr_test1qzrfa2rjtq3ky6shssmw5jj4f03qg7jvmcfkwnn77f38jxrmc4fy0srznhncjyz55t80r0tg2ptjf2hk5eut4c087ujqd8j3yl',
          // ]),
        }
      );
      const responseData = await response.json();

      setWalletData(responseData)
    }
  };

  // const getWalletData = async () => {
  //   if (walletData) {
  //     console.log('walletData', walletData);
  //     const walletIDs = walletData.map((wallet: any) => {
  //       return wallet.address;
  //     });
  //     const response = await fetch(
  //       '/api/calls/backend/getWalletBalanceByAddress',
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         // body: JSON.stringify(walletIDs), Activar esta linea cuando se arregle el endpoint
  //         body: JSON.stringify([
  //           'addr_test1qzrfa2rjtq3ky6shssmw5jj4f03qg7jvmcfkwnn77f38jxrmc4fy0srznhncjyz55t80r0tg2ptjf2hk5eut4c087ujqd8j3yl',
  //         ]), // Address quemada para obtener data
  //       }
  //     );
  //     const responseData = await response.json();

  //     return responseData;
  //   } else {
  //     throw new Error(`No se ha logeado una wallet no conectada`);
  //   }
  // };

  const connected = () => {
    if (walletData) {
      return true;
    } else {
      return false;
    }
  };

  const contextProps = useMemo(
    () => ({ walletData, handleWalletData, connected }),
    [walletData]
  );

  return (
    <SuanWalletContext.Provider value={contextProps}>
      {children}
    </SuanWalletContext.Provider>
  );
}

export default SuanWalletContext;
