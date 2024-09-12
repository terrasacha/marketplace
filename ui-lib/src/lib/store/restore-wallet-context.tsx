import { createContext, useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
const RestoreWalletContext = createContext({});

export function RestoreWalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null) as any[];
  const [walletInfo, setWalletInfo] = useState({
    name: null,
    passwd: null,
  }) as any[];
  const [recoveryWords, setRecoveryWords] = useState(
    Array(24).fill('')
  ) as any[];
  const [nextRecoveryWordIndex, setNextRecoveryWordIndex] = useState(
    recoveryWords.indexOf('')
  ) as any[];

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  async function currentAuthenticatedUser() {
    try {
      const { userId } = await getCurrentUser();
      setUser(userId);
    } catch (err) {
      console.log(err);
    }
  }
  const contextProps = {
    user,
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
    setWalletInfo,
    walletInfo,
  };
  return (
    <RestoreWalletContext.Provider value={contextProps}>
      {children}
    </RestoreWalletContext.Provider>
  );
}

export default RestoreWalletContext;
