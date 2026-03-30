import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import Sidebar from '@marketplaces/ui-lib/src/lib/layout/Sidebar';
import Navbar from '@marketplaces/ui-lib/src/lib/layout/Navbar';
import { useWallet, useAddress, useLovelace } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import WalletContext from '@marketplaces/utils-2/src/lib/context/wallet-context';
import HomeSkeleton from '@marketplaces/ui-lib/src/lib/common/skeleton/HomeSkeleton';
import { autoUnlockWallet } from '@marketplaces/ui-lib/src/lib/common/walletApi';

const getRates = async () => {
  const response = await fetch('/api/calls/getRates');
  const data = await response.json();
  let dataFormatted: any = {};
  data.map((item: any) => {
    let obj = `ADArate${item.currency}`;
    dataFormatted[obj] = parseFloat(item.value.toFixed(4));
  });
  return dataFormatted;
};

const initialStatewalletInfo = {
  name: '',
  addr: '',
  externalWallet: false,
};
const MainLayout = ({ children }: PropsWithChildren) => {
  const { connect, connected, disconnect, name, wallet } = useWallet();
  const { walletData } = useContext<any>(WalletContext);
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(initialStatewalletInfo);
  const [balance, setBalance] = useState<any>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  // Cargar estado del sidebar desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSidebarState = localStorage.getItem('sidebarOpen');
      if (savedSidebarState !== null) {
        setIsOpen(JSON.parse(savedSidebarState));
      }
    }
  }, []);

  // Guardar estado del sidebar en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    }
  }, [isOpen]);

  const { handleWalletData } = useContext<any>(WalletContext);
  useEffect(() => {
    if (walletData) {
      getRates().then((rates) => {
        setBalance((walletData.balance / 1000000).toFixed(4));
        setBalanceUSD((walletData.balance / 1000000) * rates.ADArateUSD);
      });
    }
  }, [walletData]);
  useEffect(() => {
    const fetchData = async () => {
      let access = false;

      try {
        const res = await accessHomeWithWallet();
        if (res) {
          const response = await fetch('/api/calls/backend/getWalletByUser', {
            method: 'POST',
            body: res,
          });
          const wallet = await response.json();
          if (wallet.length < 0) return router.push('/');
          if (wallet.length > 0) {
            const walletId = wallet[0].id; // Este es el wallet_id del API externo
            
            // Intentar auto-unlock primero (si hay sesión almacenada y no ha expirado)
            let autoUnlockSuccess = false;
            if (typeof window !== 'undefined') {
              const sessionKey = window.localStorage.getItem('wallet_session_key');
              const frontendSessionId = window.localStorage.getItem('wallet_frontend_session_id');
              const expiresAt = window.localStorage.getItem('wallet_session_expires_at');
              
              // Verificar si la sesión no ha expirado
              const isSessionValid = expiresAt && new Date(expiresAt) > new Date();
              
              if (sessionKey && frontendSessionId && isSessionValid) {
                try {
                  const autoUnlockResult = await autoUnlockWallet(walletId);
                  if (autoUnlockResult.success) {
                    autoUnlockSuccess = true;
                    console.log('Auto-unlock exitoso para wallet:', walletId);
                  }
                } catch (autoUnlockError) {
                  console.log('Auto-unlock no disponible o falló:', autoUnlockError);
                  // Limpiar sesión inválida si falla
                  if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('wallet_session_key');
                    window.localStorage.removeItem('wallet_frontend_session_id');
                    window.localStorage.removeItem('wallet_session_expires_at');
                  }
                }
              } else if (sessionKey && frontendSessionId && !isSessionValid) {
                // Limpiar sesión expirada
                window.localStorage.removeItem('wallet_session_key');
                window.localStorage.removeItem('wallet_frontend_session_id');
                window.localStorage.removeItem('wallet_session_expires_at');
                console.log('Sesión de auto-unlock expirada, limpiando...');
              }
            }

            const walletData = await handleWalletData({
              walletID: walletId,
              walletName: wallet[0].name,
              walletAddress: wallet[0].address,
              isWalletBySuan: true,
              isWalletAdmin: wallet[0].isAdmin,
            });
            const walletAddress = wallet[0].address;
            const hasTokenAuthFunction = await checkTokenStakeAddress(
              wallet[0].address
            );
            const userData = await fetchUserAttributes();
            if (
              hasTokenAuthFunction ||
              (userData['custom:role'] === 'marketplace_admin' &&
                userData['custom:subrole'] ===
                  process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLowerCase()) ||
              autoUnlockSuccess // Permitir acceso si auto-unlock fue exitoso
            ) {
              const address = wallet[0].address;
              setAllowAccess(true);
              setWalletInfo({
                name: (wallet[0] as any)?.name,
                addr: address,
              });
              const balance: any =
                (parseInt(walletData.balance) / 1000000).toFixed(4) || 0;
              getRates().then((rates) => {
                setBalance(balance);
                setBalanceUSD(balance * rates.ADArateUSD);
              });
              access = true;
            } else {
              sessionStorage.removeItem('preferredWalletSuan');
              /* disconnect(); */
              return router.push('/');
            }
          }
        }

        if (!access) {
          let walletName: any = sessionStorage.getItem('preferredWalletSuan');
          if (walletName) {
            connect(walletName);
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            router.push('/');
          }
        }
      } catch (error) {
        // Error handling
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (connected) {
      console.log('entro');
      const fetchData = async () => {
        const changeAddress = await wallet.getChangeAddress();
        const rewardAddresses = await wallet.getRewardAddresses();
        /* const utxos = await wallet.getUtxos();
        console.log('utxos', utxos); */

        const hasTokenAuthFunction = await checkTokenStakeAddress(
          changeAddress
        );
        const walletExists = await checkIfWalletExist(
          changeAddress,
          rewardAddresses[0],
          true
        );
        if (hasTokenAuthFunction) {
          setWalletInfo({
            name: name,
            addr: changeAddress,
            externalWallet: true,
          });
          if (hasTokenAuthFunction) {
            setAllowAccess(true);
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            disconnect();
            return router.push('/');
          }
        }
      };
      fetchData();
    }
  }, [connected]);

  const checkTokenStakeAddress = async (rewardAddresses: any) => {
    const response = await fetch('/api/calls/backend/checkTokenStakeAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rewardAddresses),
    });
    const hasTokenStakeAddress = await response.json();
    return hasTokenStakeAddress;
  };
  const accessHomeWithWallet = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
      return user.userId;
    } catch {
      return false;
    }
  };
  const checkIfWalletExist = async (
    address: string,
    stake_address: string,
    claimed_token: boolean
  ) => {
    const response = await fetch('/api/calls/backend/checkWalletByAddress', {
      method: 'POST',
      body: JSON.stringify({
        stake_address,
      }),
    });
    const walletInfoOnDB = await response.json();
    const walletData = await handleWalletData({
      walletID: walletInfoOnDB.data.id,
      walletName: '',
      walletAddress: walletInfoOnDB.data.address,
      isWalletAdmin: walletInfoOnDB.data.isAdmin,
    });
    if (!walletInfoOnDB.data) {
      const response = await fetch('/api/calls/backend/manageExternalWallets', {
        method: 'POST',
        body: JSON.stringify({
          address,
          stake_address,
          claimed_token,
        }),
      });
      const data = await response.json();

      await handleWalletData({
        walletID: data.data.id,
        walletName: '',
        walletAddress: data.data.address,
        isWalletAdmin: false,
      });
      return data;
    }
    return walletInfoOnDB;
  };
  const handleSidebarStatus = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {allowAccess ? (
        <>
          <Navbar
            walletInfo={walletInfo}
            handleSidebarStatus={handleSidebarStatus}
            isSidebarOpen={isOpen}
            balance={balance}
            balanceUSD={balanceUSD}
          />
          <Sidebar
            isOpen={isOpen}
            balance={balance}
            balanceUSD={balanceUSD}
            onClose={handleSidebarStatus}
            user={user}
            appName="Terrasacha"
            image="/v2/logoterrasacha.svg"
            heightLogo={150}
            widthLogo={300}
            poweredBy={true}
          />
          {/* Overlay para mobile cuando sidebar está abierto */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
              onClick={handleSidebarStatus}
              aria-hidden="true"
            />
          )}
          <main className={`mt-16 transition-all duration-300 ${isOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>{children}</main>
        </>
      ) : (
        <HomeSkeleton />
      )}
    </>
  );
};

export async function getServerSideProps() {
  const res = await fetch(`https://.../data`);
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}

export default MainLayout;
