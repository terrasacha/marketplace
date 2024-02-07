import { createContext, useMemo, useState } from 'react';

const WalletContext = createContext({});

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletID, setWalletID] = useState<any>(null);
  const [walletName, setWalletName] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);

  const handleWalletData = async (data: any) => {
    if (data) {
      console.log('GetUserWallet', data);
      setWalletID(data[0].id);
      setWalletName(data[0].name);
      setWalletAddress(data[0].address)
      const updatedWalletData = await fetchWalletData(data[0].address);
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
          body: JSON.stringify([wallet_address]),
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
    () => ({ walletID, walletName, walletData, handleWalletData, connected }),
    [walletData]
  );

  return (
    <WalletContext.Provider value={contextProps}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletContext;
