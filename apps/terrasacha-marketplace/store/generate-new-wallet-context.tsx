import { createContext, use, useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
const NewWalletContext = createContext({});

export function NewWalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null) as any[];
  const [walletInfo, setWalletInfo] = useState({
    name: null,
    passwd: null,
  }) as any[];
  const [words, setWords] = useState(null) as any[];
  const [loading, setLoading] = useState(false) as any[];
  const [recoveryWords, setRecoveryWords] = useState(
    Array(24).fill("")
  ) as any[];
  const [nextRecoveryWordIndex, setNextRecoveryWordIndex] = useState(
    recoveryWords.indexOf("")
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
    words,
    setWords,
    loading,
    setLoading,
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
    setWalletInfo,
    walletInfo,
  };
  return (
    <NewWalletContext.Provider value={contextProps}>
      {children}
    </NewWalletContext.Provider>
  );
}

export default NewWalletContext;
