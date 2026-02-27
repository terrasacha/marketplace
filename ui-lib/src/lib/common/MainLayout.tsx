import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Sidebar from '@marketplaces/ui-lib/src/lib/layout/Sidebar';
import Navbar from '@marketplaces/ui-lib/src/lib/layout/Navbar';
import { useWallet } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import WalletContext from '@marketplaces/utils-2/src/lib/context/wallet-context';
import HomeSkeleton from "@marketplaces/ui-lib/src/lib/common/skeleton/HomeSkeleton";
import { autoUnlockWallet } from '@marketplaces/ui-lib/src/lib/common/walletApi';
import WalletUnlockModal from '@marketplaces/ui-lib/src/lib/modals/WalletUnlockModal';

// Constantes
const WALLET_SESSION_KEYS = {
  SESSION_KEY: 'wallet_session_key',
  FRONTEND_SESSION_ID: 'wallet_frontend_session_id',
  EXPIRES_AT: 'wallet_session_expires_at',
} as const;

const initialStatewalletInfo = {
  name: '',
  addr: '',
  externalWallet: false,
};

// Cache para rates (evitar múltiples llamadas)
let ratesCache: any = null;
let ratesCacheTimestamp: number = 0;
const RATES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Utilidades para manejo de sesión de billetera
const getWalletSession = () => {
  if (typeof window === 'undefined') return null;
  
  const sessionKey = window.localStorage.getItem(WALLET_SESSION_KEYS.SESSION_KEY);
  const frontendSessionId = window.localStorage.getItem(WALLET_SESSION_KEYS.FRONTEND_SESSION_ID);
  const expiresAt = window.localStorage.getItem(WALLET_SESSION_KEYS.EXPIRES_AT);
  
  if (!sessionKey || !frontendSessionId || !expiresAt) return null;
  
  const isSessionValid = new Date(expiresAt) > new Date();
  
  return {
    sessionKey,
    frontendSessionId,
    expiresAt,
    isSessionValid,
  };
};

const clearWalletSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(WALLET_SESSION_KEYS.SESSION_KEY);
  window.localStorage.removeItem(WALLET_SESSION_KEYS.FRONTEND_SESSION_ID);
  window.localStorage.removeItem(WALLET_SESSION_KEYS.EXPIRES_AT);
};

const getWalletIdFromSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = window.localStorage.getItem('wallet_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session?.wallet_id ?? null;
    }
  } catch (_) {}
  return null;
};

/** True si ya hay sesión de billetera desbloqueada (p. ej. desde login) para ese wallet_id */
const hasValidWalletSessionForWallet = (walletId: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const sessionStr = window.localStorage.getItem('wallet_session');
    if (!sessionStr) return false;
    const session = JSON.parse(sessionStr);
    return !!(session?.access_token && session?.wallet_id === walletId);
  } catch (_) {}
  return false;
};

const getRates = async (): Promise<any> => {
  const now = Date.now();
  
  // Retornar cache si está válido
  if (ratesCache && (now - ratesCacheTimestamp) < RATES_CACHE_DURATION) {
    return ratesCache;
  }
  
  try {
    const response = await fetch('/api/calls/getRates');
    const data = await response.json();
    const dataFormatted: any = {};
    
    data.forEach((item: any) => {
      const obj = `ADArate${item.currency}`;
      dataFormatted[obj] = parseFloat(item.value.toFixed(4));
    });
    
    ratesCache = dataFormatted;
    ratesCacheTimestamp = now;
    return dataFormatted;
  } catch (error) {
    console.error('Error fetching rates:', error);
    // Retornar cache anterior si hay error
    return ratesCache || {};
  }
};

interface WalletInfo {
  id: string;
  name: string;
  address: string;
  isAdmin: boolean;
}

const MainLayout = ({ children }: PropsWithChildren) => {
  const { connect } = useWallet();
  const { walletData, handleWalletData } = useContext<any>(WalletContext);
  const router = useRouter();
  
  // Estados de autenticación Cognito
  const [user, setUser] = useState<any>(null);
  const [cognitoAuthenticated, setCognitoAuthenticated] = useState<boolean>(false);
  
  // Estados de billetera
  const [walletInfo, setWalletInfo] = useState<any>(initialStatewalletInfo);
  const [balance, setBalance] = useState<any>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  
  // Estados de UI
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  const [currentWalletName, setCurrentWalletName] = useState<string | null>(null);
  
  // Refs para evitar re-ejecuciones
  const initializationRef = useRef<boolean>(false);
  const walletInitializedRef = useRef<boolean>(false);

  // Función para verificar y manejar auto-unlock de billetera
  const handleWalletAutoUnlock = useCallback(async (walletId: string): Promise<boolean> => {
    const session = getWalletSession();
    
    if (!session) {
      console.log('🔒 No hay sesión de auto-unlock almacenada');
      return false;
    }
    
    if (!session.isSessionValid) {
      console.log('⏰ Sesión expirada - Limpiando datos de sesión');
      clearWalletSession();
      return false;
    }
    
    try {
      const autoUnlockResult = await autoUnlockWallet(walletId);
      if (autoUnlockResult.success) {
        console.log('✅ Sesión válida - Auto-unlock exitoso para wallet:', walletId);
        return true;
      } else {
        console.log('❌ Sesión inválida - Auto-unlock falló');
        clearWalletSession();
        return false;
      }
    } catch (autoUnlockError) {
      console.log('❌ Sesión inválida - Error en auto-unlock:', autoUnlockError);
      clearWalletSession();
      return false;
    }
  }, []);

  // Función para inicializar datos de billetera (sin intentar auto-unlock)
  const initializeWalletData = useCallback(async (wallet: WalletInfo): Promise<boolean> => {
    try {
      const walletDataResult = await handleWalletData({
        walletID: wallet.id,
        walletName: wallet.name,
        walletAddress: wallet.address,
        isWalletBySuan: true,
        isWalletAdmin: wallet.isAdmin,
      });
      
      if (walletDataResult) {
        setWalletInfo({
          name: wallet.name,
          addr: wallet.address,
        });
        
        // Calcular balance con rates
        const rates = await getRates();
        const balanceADA = (parseInt(walletDataResult.balance) / 1000000).toFixed(4);
        setBalance(balanceADA);
        setBalanceUSD(parseFloat(balanceADA) * (rates.ADArateUSD || 0));
      }
      
      return true; // Billetera inicializada
    } catch (error) {
      console.error('Error inicializando datos de billetera:', error);
      return false;
    }
  }, [handleWalletData]);

  // Función para inicializar billetera después de autenticación exitosa (intenta auto-unlock o usa sesión existente)
  const initializeWallet = useCallback(async (wallet: WalletInfo): Promise<boolean> => {
    if (walletInitializedRef.current) return false;
    walletInitializedRef.current = true;
    
    const walletId = wallet.id;
    // Si el usuario ya desbloqueó desde WelcomeCard2 (wallet_session con access_token), no pedir de nuevo
    if (hasValidWalletSessionForWallet(walletId)) {
      return await initializeWalletData(wallet);
    }
    
    const autoUnlockSuccess = await handleWalletAutoUnlock(walletId);
    
    // Si no hay auto-unlock exitoso, mostrar modal y retornar false
    if (!autoUnlockSuccess) {
      setCurrentWalletId(walletId);
      setCurrentWalletName(wallet.name || null);
      setIsUnlockModalOpen(true);
      return false; // Billetera no desbloqueada aún
    }
    
    // Si auto-unlock fue exitoso, inicializar datos
    return await initializeWalletData(wallet);
  }, [handleWalletAutoUnlock, initializeWalletData]);

  // Función para verificar autenticación de Cognito
  const checkCognitoAuth = useCallback(async (): Promise<string | null> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setCognitoAuthenticated(true);
      return currentUser.userId;
    } catch (error) {
      console.error('Error verificando autenticación Cognito:', error);
      setCognitoAuthenticated(false);
      return null;
    }
  }, []);

  // Función para verificar permisos de usuario
  const checkUserPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const userData = await fetchUserAttributes();
      const isMarketplaceAdmin = 
        userData['custom:role'] === 'marketplace_admin' &&
        userData['custom:subrole'] === process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLowerCase();
      
      return isMarketplaceAdmin;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }, []);

  // Función principal de inicialización
  const initializeApp = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    
    try {
      // 1. Verificar autenticación Cognito
      const userId = await checkCognitoAuth();
      if (!userId) {
        router.push('/');
        return;
      }
      
      // 2. Obtener billetera del usuario
      const response = await fetch('/api/calls/backend/getWalletByUser', {
        method: 'POST',
        body: userId,
      });
      
      const wallets: WalletInfo[] = await response.json();
      
      if (!wallets || wallets.length === 0) {
        // Intentar conectar billetera externa
        const walletName = sessionStorage.getItem('preferredWalletSuan');
        if (walletName) {
          connect(walletName);
        } else {
          sessionStorage.removeItem('preferredWalletSuan');
          router.push('/');
        }
        return;
      }

      const sessionWalletId = getWalletIdFromSession();
      const wallet =
        (sessionWalletId && wallets.find((w: WalletInfo) => w.id === sessionWalletId)) ||
        wallets[0];
      
      // 3. Inicializar billetera (intenta auto-unlock o muestra modal)
      try {
        const walletInitialized = await initializeWallet(wallet);
        
        // 4. Si la billetera no se inicializó (modal abierto), no permitir acceso aún
        // El acceso se permitirá cuando el usuario desbloquee la billetera exitosamente
        if (!walletInitialized) {
          // El modal está abierto, esperar a que el usuario desbloquee
          // No redirigir, solo no permitir acceso todavía
          console.log('Modal de desbloqueo abierto, esperando desbloqueo del usuario');
          return;
        }
        
        // 5. Verificar permisos solo después de que la billetera esté desbloqueada
        const hasPermissions = await checkUserPermissions();
        const session = getWalletSession();
        const hasValidWalletSession =
          session?.isSessionValid || hasValidWalletSessionForWallet(wallet.id);
        
        if (!hasPermissions && !hasValidWalletSession) {
          console.log('Usuario sin permisos y sin sesión válida, redirigiendo');
          sessionStorage.removeItem('preferredWalletSuan');
          router.push('/');
          return;
        }
        
        // 6. Permitir acceso
        setAllowAccess(true);
      } catch (walletError) {
        // Si hay error al inicializar billetera, mostrar modal si es posible
        console.error('Error al inicializar billetera:', walletError);
        // Intentar mostrar modal de desbloqueo como fallback
        if (wallet.id) {
          setCurrentWalletId(wallet.id);
          setCurrentWalletName(wallet.name || null);
          setIsUnlockModalOpen(true);
          return;
        }
        // Si no podemos mostrar modal, redirigir
        router.push('/');
        return;
      }
      
    } catch (error) {
      console.error('Error en inicialización:', error);
      router.push('/');
    }
  }, [checkCognitoAuth, checkUserPermissions, initializeWallet, connect, router]);

  // Efecto para actualizar balance cuando cambia walletData (o la billetera activa)
  useEffect(() => {
    if (walletData == null) return;

    const balanceADA = ((walletData.balance ?? 0) / 1000000).toFixed(4);
    getRates().then((rates) => {
      setBalance(balanceADA);
      setBalanceUSD(parseFloat(balanceADA) * (rates.ADArateUSD || 0));
    });
  }, [walletData?.balance, walletData?.address]); // address para que al cambiar de billetera siempre se actualice

  // Efecto de inicialización (solo una vez)
  useEffect(() => {
    initializeApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleSidebarStatus = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleUnlockSuccess = useCallback(async () => {
    setIsUnlockModalOpen(false);
    
    // Obtener la billetera nuevamente para inicializarla
    try {
      const userId = await checkCognitoAuth();
      if (!userId) {
        router.push('/');
        return;
      }
      
      const response = await fetch('/api/calls/backend/getWalletByUser', {
        method: 'POST',
        body: userId,
      });
      
      const wallets: WalletInfo[] = await response.json();
      
      if (wallets && wallets.length > 0) {
        const sessionWalletId = getWalletIdFromSession();
        const wallet =
          (sessionWalletId && wallets.find((w: WalletInfo) => w.id === sessionWalletId)) ||
          wallets[0];

        // Inicializar datos de billetera directamente (sin intentar auto-unlock)
        // porque ya se hizo unlock manual
        const walletInitialized = await initializeWalletData(wallet);
        
        if (walletInitialized) {
          // Verificar permisos
          const hasPermissions = await checkUserPermissions();
          const session = getWalletSession();
          const hasValidWalletSession = session?.isSessionValid || false;
          
          if (hasPermissions || hasValidWalletSession) {
            setAllowAccess(true);
            setCurrentWalletId(null);
            setCurrentWalletName(null);
            walletInitializedRef.current = true; // Marcar como inicializada
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            router.push('/');
          }
        }
      }
    } catch (error) {
      console.error('Error después de unlock:', error);
      router.push('/');
    }
  }, [checkCognitoAuth, checkUserPermissions, initializeWalletData, router]);

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

export default MainLayout;
