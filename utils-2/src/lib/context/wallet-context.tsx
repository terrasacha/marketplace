import { createContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { getProjects } from '@marketplaces/data-access';
import { getActualPeriod, getAssetsLockedValue } from '../utils-2';
import { BsWindowSidebar } from 'react-icons/bs';
import { MinLovelaceResponse } from '../generic/getAssetsLockedValue';
import {
  getWalletBalance,
  getWalletAddresses,
  getWalletInfo,
} from '@marketplaces/ui-lib/src/lib/common/walletApi';

const WalletContext = createContext({});

// Constantes para polling
const POLLING_INTERVAL = 2000; // Verificar cada 2 segundos
const POLLING_THROTTLE = 30000; // Ejecutar fetch cada 30 segundos

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
  const [walletRole, setWalletRole] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [lastSyncDate, setLastSyncDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [prevBalance, setPrevBalance] = useState<any>(null);
  const [balanceChanged, setBalanceChanged] = useState(0);
  const [walletLockedBalance, setWalletLockedBalance] =
    useState<MinLovelaceResponse>(null);
  const [walletAvailableBalance, setWalletAvailableBalance] =
    useState<any>(null);
  const [walletTotalBalance, setWalletTotalBalance] = useState<any>(null);

  // Refs para evitar re-renders innecesarios
  const walletIDRef = useRef<string | null>(null);
  const walletBySuanRef = useRef<boolean>(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevBalanceRef = useRef<any>(null);

  // Función auxiliar para obtener stake_address
  const getStakeAddress = useCallback(async (walletId: string): Promise<string> => {
    try {
      const addressesResult = await getWalletAddresses(walletId, 1);
      if (
        addressesResult.success &&
        addressesResult.data?.addresses &&
        addressesResult.data.addresses.length > 0
      ) {
        return addressesResult.data.addresses[0].staking_address || '';
      }
    } catch (addrError) {
      console.error('Error al obtener direcciones de la billetera:', addrError);
    }
    return '';
  }, []);

  // Función principal para obtener datos de la billetera
  const fetchWalletData = useCallback(async (wAddress: string | null = null) => {
    const wallet_address = walletAddress || wAddress;
    const currentWalletID = walletIDRef.current;
    const isWalletBySuan = walletBySuanRef.current;

    if (!wallet_address || !currentWalletID) {
      setIsLoading(false);
      setWalletData(null);
      return null;
    }

    setIsLoading(true);

    try {
      // 1. Obtener balance desde el API de wallet
      const balanceResult = await getWalletBalance(currentWalletID);

      if (!balanceResult.success || !balanceResult.data) {
        throw new Error(
          balanceResult.error || 'No se pudo obtener el balance de la billetera'
        );
      }

      // Asegurarse de que el balance sea un número
      const totalBalanceLovelace = Number(
        balanceResult.data?.balances?.main_addresses.enterprise.balance_lovelace ?? 0
      );

      // 2. Obtener stake_address (no crítico, puede fallar silenciosamente)
      const stake_address = await getStakeAddress(currentWalletID);

      const responseData = {
        address: wallet_address,
        stake_address,
        script_address: false,
        balance: totalBalanceLovelace,
        assets: [], // Por ahora no tenemos assets desde el API de balance
      };

      // Inicializar prevBalance si es la primera vez
      if (prevBalanceRef.current === null) {
        prevBalanceRef.current = responseData.balance;
        setPrevBalance(responseData.balance);
      }

      // TODO: Implementar el cálculo de blockedLovelace
      const blockedLovelace = 0;
      setWalletData(responseData);

      if (blockedLovelace && responseData.balance) {
        setWalletTotalBalance(responseData.balance);
        const availableBalance = responseData.balance - blockedLovelace;
        setWalletAvailableBalance(availableBalance >= 0 ? availableBalance : 0);
        setWalletLockedBalance(
          responseData.assets.length > 0 ? blockedLovelace : 0
        );
      }

      setIsLoading(false);
      setLastSyncDate(Date.now());
      return responseData;
    } catch (error) {
      console.error('Error al obtener datos de la billetera:', error);
      const errorResponseData = {
        address: wallet_address,
        stake_address: '',
        script_address: false,
        balance: 0,
        assets: [],
      };
      setWalletData(errorResponseData);
      setIsLoading(false);
      setLastSyncDate(Date.now());
      return errorResponseData;
    }
  }, [walletAddress, getStakeAddress]);

  const handleWalletData = useCallback(async ({
    walletID,
    walletName,
    walletAddress,
    isWalletBySuan = false,
    isWalletAdmin = false,
  }: any) => {
    if (!walletAddress) {
      return null;
    }

    // Actualizar estados y refs
    setWalletID(walletID);
    setWalletName(walletName);
    setWalletAddress(walletAddress);
    setWalletBySuan(isWalletBySuan);
    setWalletAdmin(isWalletAdmin);
    
    // Actualizar refs para evitar dependencias en callbacks
    walletIDRef.current = walletID;
    walletBySuanRef.current = isWalletBySuan;

    // Obtener información de la wallet (incluyendo role) si hay walletID
    if (walletID) {
      try {
        const walletInfoResult = await getWalletInfo(walletID);
        if (walletInfoResult.success && walletInfoResult.data) {
          setWalletRole(walletInfoResult.data.role || null);
        } else {
          setWalletRole(null);
        }
      } catch (error) {
        console.error('Error al obtener información de la wallet:', error);
        setWalletRole(null);
      }
    } else {
      setWalletRole(null);
    }

    const updatedWalletData = await fetchWalletData(walletAddress);
    
    if (updatedWalletData) {
      setWalletStakeAddress(updatedWalletData.stake_address);
    }
    
    return updatedWalletData;
  }, [fetchWalletData]);

  const handleClearData = useCallback(() => {
    setWalletID(null);
    setWalletName(null);
    setWalletAddress(null);
    setWalletStakeAddress(null);
    setWalletBySuan(false);
    setWalletAdmin(false);
    setWalletRole(null);
    setWalletData(null);
    setLastSyncDate(null);
    setIsLoading(false);
    setPrevBalance(null);
    setBalanceChanged(0);
    
    // Limpiar refs
    walletIDRef.current = null;
    walletBySuanRef.current = false;
    prevBalanceRef.current = null;
    
    // Limpiar polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const connected = useCallback(() => {
    return !!walletData;
  }, [walletData]);

  // Efecto para polling de balance
  useEffect(() => {
    // Solo hacer polling si hay walletID y walletAddress
    if (!walletIDRef.current || !walletAddress) {
      return;
    }

    // Inicializar timestamp en sessionStorage si no existe
    if (typeof window !== 'undefined' && !window.sessionStorage.getItem('checkBalance')) {
      const timestamp = Date.now();
      window.sessionStorage.setItem('checkBalance', JSON.stringify(timestamp));
    }

    const startPolling = () => {
      // Limpiar intervalo anterior si existe
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(async () => {
        if (typeof window === 'undefined') return;
        
        const timestamp = Date.now();
        const storedTimestamp = window.sessionStorage.getItem('checkBalance');
        
        if (!storedTimestamp) {
          window.sessionStorage.setItem('checkBalance', JSON.stringify(timestamp));
          return;
        }

        const timeToVerify = parseInt(storedTimestamp) + POLLING_THROTTLE;
        
        if (timestamp > timeToVerify) {
          window.sessionStorage.setItem('checkBalance', JSON.stringify(timestamp));

          console.log('Fetching WalletData from polling');
          const walletDataResult = await fetchWalletData();

          if (walletDataResult) {
            // Asegurarse de que el balance sea un número
            const newBalance = Number(walletDataResult.balance) || 0;
            const currentPrevBalance = prevBalanceRef.current;
            
            if (currentPrevBalance !== null && currentPrevBalance !== newBalance) {
              setBalanceChanged(newBalance - currentPrevBalance);
              prevBalanceRef.current = newBalance;
              setPrevBalance(newBalance);

              setTimeout(() => {
                setBalanceChanged(0);
              }, 2000);
            } else if (currentPrevBalance === null) {
              prevBalanceRef.current = newBalance;
              setPrevBalance(newBalance);
            }
          }
        }
      }, POLLING_INTERVAL);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'visible') {
      startPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [walletAddress, fetchWalletData]);

  const contextProps = useMemo(
    () => ({
      walletID,
      walletName,
      walletAddress,
      walletStakeAddress,
      walletBySuan,
      walletAdmin,
      walletRole,
      walletData,
      isLoading,
      lastSyncDate,
      balanceChanged,
      walletLockedBalance,
      walletAvailableBalance,
      walletTotalBalance,
      handleWalletData,
      handleClearData,
      fetchWalletData,
      connected,
    }),
    [
      walletID,
      walletName,
      walletAddress,
      walletStakeAddress,
      walletBySuan,
      walletAdmin,
      walletRole,
      walletData,
      isLoading,
      lastSyncDate,
      balanceChanged,
      walletLockedBalance,
      walletAvailableBalance,
      walletTotalBalance,
      handleWalletData,
      handleClearData,
      fetchWalletData,
      connected,
    ]
  );

  return (
    <WalletContext.Provider value={contextProps}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletContext;
