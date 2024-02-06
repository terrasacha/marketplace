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
  const [walletID, setWalletID] = useState<any>(null);
  const [walletName, setWalletName] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);

  const handleWalletData = async (data: any) => {
    if (data) {
      console.log("data", data)
      setWalletID(data[0].id)
      setWalletName(data[0].name)
      const updatedWalletData = await fetchWalletData(data[0].address)

      console.log(updatedWalletData)

      setWalletData(updatedWalletData)
    }
  };

  const handleClearData = () => {
    setWalletID(null)
    setWalletName(null)
    setWalletData(null)
  }

  const fetchWalletData = async (wID : string | null = null) => {
    const wallet_id = walletID || wID

    if (wallet_id) {
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([wallet_id]),
        }
      );
      const responseData = await response.json();

      return responseData[0];
    }
    return null
  };

  const connected = () => {
    if (walletData) {
      return true;
    } else {
      return false;
    }
  };

  const contextProps = useMemo(
    () => ({ walletID, walletName, walletData, handleWalletData, connected }),
    [walletData]
  );

  return (
    <SuanWalletContext.Provider value={contextProps}>
      {children}
    </SuanWalletContext.Provider>
  );
}

export default SuanWalletContext;
