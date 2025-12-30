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
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import WalletContext from '@marketplaces/utils-2/src/lib/context/wallet-context';
import HomeSkeleton from "@marketplaces/ui-lib/src/lib/common/skeleton/HomeSkeleton";
import { autoUnlockWallet } from '@marketplaces/ui-lib/src/lib/common/walletApi';
import WalletUnlockModal from '@marketplaces/ui-lib/src/lib/modals/WalletUnlockModal';

const getRates = async () => {
  const response = await fetch('/api/calls/getRates')
  const data = await response.json()
  let dataFormatted: any = {}
  data.map((item: any) => {
      let obj = `ADArate${item.currency}`
      dataFormatted[obj] = parseFloat(item.value.toFixed(4))
  });
  return dataFormatted
}

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
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  const [currentWalletName, setCurrentWalletName] = useState<string | null>(null);
  const router = useRouter();

  const { handleWalletData } = useContext<any>(WalletContext);

  useEffect(() => {
    if (walletData) {
      getRates().then((rates) => {
        console.log(rates, 'rates 47');
        setBalance((walletData.balance / 1000000).toFixed(4));
        setBalanceUSD((walletData.balance / 1000000) * rates.ADArateUSD);
      });
    }
  }, [walletData]);

  useEffect(() => {
    if (window.sessionStorage.getItem('hasTokenAuth') === 'true') {
      setAllowAccess(true);
    }
    console.log('entro');
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
          console.log('wallettt', wallet);
          if (wallet.length < 0) return router.push('/');
          if (wallet.length > 0) {
            const walletId = wallet[0].id; // Este es el wallet_id del API externo
            console.log('walletId', walletId);
            // Validar sesión de auto-unlock
            let autoUnlockSuccess = false;
            let shouldShowModal = false;
          
            const sessionKey = window.localStorage.getItem('wallet_session_key');
            const frontendSessionId = window.localStorage.getItem('wallet_frontend_session_id');
            const expiresAt = window.localStorage.getItem('wallet_session_expires_at');
            
            // Verificar si la sesión no ha expirado
            const isSessionValid = expiresAt && new Date(expiresAt) > new Date();
            
            if (sessionKey && frontendSessionId && isSessionValid) {
              // Sesión válida - intentar auto-unlock
              try {
                const autoUnlockResult = await autoUnlockWallet(walletId);
                if (autoUnlockResult.success) {
                  autoUnlockSuccess = true;
                  console.log('✅ Sesión válida - Auto-unlock exitoso para wallet:', walletId);
                } else {
                  // Auto-unlock falló - sesión inválida
                  console.log('❌ Sesión inválida - Auto-unlock falló');
                  window.localStorage.removeItem('wallet_session_key');
                  window.localStorage.removeItem('wallet_frontend_session_id');
                  window.localStorage.removeItem('wallet_session_expires_at');
                  shouldShowModal = true;
                }
              } catch (autoUnlockError) {
                console.log('❌ Sesión inválida - Error en auto-unlock:', autoUnlockError);
                // Limpiar sesión inválida si falla
                window.localStorage.removeItem('wallet_session_key');
                window.localStorage.removeItem('wallet_frontend_session_id');
                window.localStorage.removeItem('wallet_session_expires_at');
                shouldShowModal = true;
              }
            } else if (sessionKey && frontendSessionId && !isSessionValid) {
              // Sesión expirada
              console.log('⏰ Sesión expirada - Limpiando datos de sesión');
              window.localStorage.removeItem('wallet_session_key');
              window.localStorage.removeItem('wallet_frontend_session_id');
              window.localStorage.removeItem('wallet_session_expires_at');
              shouldShowModal = true;
            } else {
              // No hay sesión almacenada
              console.log('🔒 No hay sesión de auto-unlock almacenada');
              // Si no hay sesión, redirigir a "/" en lugar de mostrar modal
              return router.push('/');
            }

            // Si necesitamos mostrar el modal, configurarlo y retornar
            if (shouldShowModal && !autoUnlockSuccess) {
              setCurrentWalletId(walletId);
              setCurrentWalletName(wallet[0].name || null);
              setIsUnlockModalOpen(true);
              return;
            }
            access = true;

            // Si auto-unlock fue exitoso, continuar con el flujo normal
            /* const walletData = await handleWalletData({
              walletID: walletId,
              walletName: wallet[0].name,
              walletAddress: wallet[0].address,
              isWalletBySuan: true,
              isWalletAdmin: wallet[0].isAdmin,
            });
            console.log(walletData, 'walletData mainlayout');
            const userData = await fetchUserAttributes();
            if (
              (userData['custom:role'] === 'marketplace_admin' &&
                userData['custom:subrole'] ===
                  process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLowerCase()) ||
              autoUnlockSuccess // Permitir acceso si auto-unlock fue exitoso
            ) {
              window.sessionStorage.setItem('hasTokenAuth', 'true');
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
              return router.push('/');
            } */
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
        console.error('Error:', error);
        router.push('/');
      }
    };

    fetchData();
  }, []);

  const accessHomeWithWallet = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
      return user.userId;
    } catch {
      return false;
    }
  };

  const handleSidebarStatus = () => {
    setIsOpen(!isOpen);
  };

  const handleUnlockSuccess = () => {
    setIsUnlockModalOpen(false);
    setCurrentWalletId(null);
    setCurrentWalletName(null);
    // Recargar la página para aplicar los cambios
    window.location.reload();
  };

  return (
    <>
      {currentWalletId && (
        <WalletUnlockModal
          isOpen={isUnlockModalOpen}
          walletId={currentWalletId}
          walletName={currentWalletName || undefined}
          onSuccess={handleUnlockSuccess}
        />
      )}
      {allowAccess ? (
        <>
          <Navbar
            walletInfo={walletInfo}
            handleSidebarStatus={handleSidebarStatus}
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
          <main className="lg:ml-80 mt-20">{children}</main>
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