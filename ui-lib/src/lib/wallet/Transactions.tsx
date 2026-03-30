import { useContext, useEffect, useState } from 'react';
import LoadingOverlay from '../common/LoadingOverlay';
import { RefreshIcon } from '../icons/RefreshIcon';
import TransactionInfoCard from '../wallet/sign-transaction/TransactionInfoCard';
import {
  WalletContext,
  getDateFromTimeStamp,
  mapTransactionListInfo,
} from '@marketplaces/utils-2';
import { TRANSACTION_CONFIRMED_EVENT } from './PendingTransactionFloatingCard';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { mapAccountTxData } from '@marketplaces/utils-2/src/lib/mappers/mapTransactionInfo';
import { MessageList } from '../ui-lib';

// Función helper para obtener access token
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = window.localStorage.getItem('wallet_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.access_token || null;
    }
  } catch (err) {
    console.error('Error al obtener el access_token:', err);
  }
  return null;
};

interface TransactionsProps {
  txPerPage: number;
}

export default function Transactions(props: TransactionsProps) {
  const { txPerPage } = props;
  const {
    walletData,
    walletID,
    walletAddress,
    fetchWalletData,
    balanceChanged,
  } = useContext<any>(WalletContext);
  const [transactionsList, setTransactionsList] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [paginationMetadata, setPaginationMetadata] = useState<any>({
    currentPage: 1,
    pageSize: 0,
    totalItems: 0,
  });
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    /* const pendingTx = router.query.pendingTx; */

    const pendingTx = localStorage.getItem('pendingTx');

    const currentDate = new Date();

    if (pendingTx && typeof pendingTx === 'string') {
      const { data, timestamp } = JSON.parse(pendingTx);

      if (Date.now() - timestamp > 300000) {
        // Eliminar pendingTx despues de 5 min
        localStorage.removeItem('pendingTx');
        setPendingTransaction(null);
        return;
      }

      setPendingTransaction((prevState: any) => {
        return {
          ...data,
          title: 'Envio de fondos',
          subtitle: getDateFromTimeStamp(currentDate.getTime() / 1000),
          tx_type: 'sent',
          tx_status: 'pending',
          tx_confirmation_status: 'LOW',
          tx_confirmation_n: 0,
        };
      });
    }
  }, [router.query]);
  useEffect(() => {
    if (walletAddress) {
      getTransactionsData(1, false);
    }
  }, [router, walletAddress]);

  // Cuando el card flotante confirma una tx, refrescar historial para mostrar la nueva transacción
  useEffect(() => {
    const onTransactionConfirmed = () => {
      if (walletAddress) getTransactionsData(1, true);
    };
    window.addEventListener(TRANSACTION_CONFIRMED_EVENT, onTransactionConfirmed);
    return () => window.removeEventListener(TRANSACTION_CONFIRMED_EVENT, onTransactionConfirmed);
  }, [walletAddress]);

  useEffect(() => {
    const clearAllCaches = () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('/api/transactions/address-history')) {
          localStorage.removeItem(key);
        }
      });
    };

    if (balanceChanged !== 0) {
      // Limpiar todas las caches
      clearAllCaches();

      // Traer datos de tabla
      getTransactionsData(1, true);
    }
  }, [balanceChanged]);

  const fetchWithCache = async (
    url: string,
    payload: any,
    invalidateCache: boolean = false,
    accessToken: string | null = null
  ) => {
    const cacheKey = `${url}-${JSON.stringify(payload)}`;

    if (!invalidateCache) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 60 * 60 * 1000 && !data?.error) {
          // Invalida después de 1 hora
          return data;
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar Authorization header si hay access token
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );

    return data;
  };

  const getTransactionsData = async (
    page: number = 1,
    invalidateCache: boolean = false
  ) => {
    setIsLoading(true);

    // Obtener access token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error('No se encontró el token de acceso. Por favor, desbloquea la billetera.');
      setIsLoading(false);
      return;
    }

    const payload = {
      address: walletAddress,
      page: page,
      limit: txPerPage,
    };
    console.log(payload);

    try {
      const responseData = await fetchWithCache(
        '/api/transactions/address-history',
        payload,
        invalidateCache,
        accessToken
      );

      console.log('responseData completo:', responseData);

      // Verificar si hay error en la respuesta
      if (responseData?.error || responseData?.success === false) {
        const errorMessage = responseData?.error || responseData?.details?.[0]?.message || 'Hubo un error sincronizando el historial de transacciones';
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // El nuevo endpoint devuelve { transactions: [...], total, page, limit, has_more }
      // Si no hay campo success, asumimos que es exitoso si tiene transactions
      const transactions = responseData.transactions || [];

      if (!Array.isArray(transactions)) {
        console.error('Las transacciones no son un array:', transactions);
        toast.error('Formato de respuesta inválido');
        setIsLoading(false);
        return;
      }

      console.log('transactions recibidas:', transactions.length);

      if (pendingTransaction) {
        const isPendingTxOk = transactions.find(
          (tx: any) => tx.hash === pendingTransaction.tx_id
        );

        if (isPendingTxOk) {
          localStorage.removeItem('pendingTx');
          setPendingTransaction(null);
        }
      }

      const paginationMetadataItem = {
        currentPage: responseData.page || page,
        pageSize: responseData.limit || txPerPage,
        totalItems: responseData.total || 0,
        hasMore: responseData.has_more || false,
      };

      console.log('Mapeando transacciones, walletAddress:', walletData?.address);
      console.log('Datos de transacciones antes del mapeo:', transactions);
      
      if (!walletData?.address) {
        console.error('walletAddress no está disponible');
        toast.error('No se pudo obtener la dirección de la billetera');
        setIsLoading(false);
        return;
      }

      const mappedTransactionListData = await mapAccountTxData({
        walletAddress: walletData.address,
        data: transactions, // Pasar solo el array de transacciones
      });

      console.log('mappedTransactionListData:', mappedTransactionListData);
      console.log('Cantidad de transacciones mapeadas:', mappedTransactionListData?.length);
      console.log('Tipo de mappedTransactionListData:', typeof mappedTransactionListData, Array.isArray(mappedTransactionListData));

      //getPendingTransaction(mappedTransactionListData);
      setTransactionsList(Array.isArray(mappedTransactionListData) ? mappedTransactionListData : []);
      setPaginationMetadata(paginationMetadataItem);
    } catch (error: any) {
      console.error('Error al obtener transacciones:', error);
      toast.error(error?.message || 'Error al obtener el historial de transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  /* const checkTxConfirmations = async () => {
    if (!pendingTransaction?.tx_id) return;
    const res = await fetch(`/api/transactions/${encodeURIComponent(pendingTransaction.tx_id)}/status`, { method: 'GET' });
    const data = await res.json().catch(() => null);
    const confirmations = data?.confirmations;
    const status = data?.status;
    if (data && (status === 'CONFIRMED' || (confirmations != null && confirmations >= 1))) {
      const newStatePendingTransaction = {
        ...pendingTransaction,
        tx_status: 'on-chain',
        tx_confirmation_status: 'LOW',
        tx_confirmation_n: confirmations ?? 1,
      };
      const pendingTx = localStorage.getItem('pendingTx');
      if (pendingTx && typeof pendingTx === 'string') {
        setPendingTransaction(newStatePendingTransaction);
        const parsedPendingTx = JSON.parse(pendingTx);
        localStorage.setItem('pendingTx', JSON.stringify({ data: newStatePendingTransaction, timestamp: parsedPendingTx.timestamp }));
      }
    }
  }; */

  /*   useEffect(() => {
    if (pendingTransaction) {
      setTimeout(checkTxConfirmations, 20000);
    }
  }, [pendingTransaction]); */

  // Pagination
  /* const indexOfLastItem =
    paginationMetadata.currentPage * paginationMetadata.pageSize;
  const indexOfFirstItem = indexOfLastItem - paginationMetadata.pageSize; */
  // const currentItems = transactionsList.slice(
  //   indexOfFirstItem,
  //   indexOfLastItem
  // );

  const canShowPrevious = paginationMetadata.currentPage > 1;
  const canShowNext = paginationMetadata.hasMore || false;

  const changePage = async (changeValue: number) => {
    setIsLoading(true);

    await getTransactionsData(paginationMetadata.currentPage + changeValue);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchWalletData();
    await getTransactionsData(paginationMetadata.currentPage, true);
    setIsLoading(false);
  };
  const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente:'font-jostBold',
      fuenteAlterna:'font-jostRegular',
    },
  
    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor:  'bg-custom-dark' ,
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente:'font-semibold',
    fuenteAlterna:'font-medium',
  };
  return (
    <div className={`${colors.fuenteAlterna} col-span-2 h-fit bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 animate-scale-in`}>
      {/* Header modernizado */}
      <div className="pt-6 px-6 pb-4 border-b border-gray-100/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className={`mb-0 text-2xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent`}>
                Transacciones
              </h3>
              <p className="mb-0 text-sm text-gray-500 font-jostRegular">Historial completo de movimientos</p>
            </div>
          </div>
          <button
            type="button"
            className={`relative text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 font-jostBold rounded-lg text-sm p-2.5 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${
              isLoading ? 'opacity-75 cursor-progress' : ''
            }`}
            disabled={isLoading}
            onClick={() => handleRefresh()}
            aria-label="Actualizar transacciones"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <div className={`relative z-10 ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshIcon />
            </div>
          </button>
        </div>
      </div>
      {/* Body modernizado */}
      <div className="p-6">
        {transactionsList.length === 0 && !isLoading && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-custom-marca-boton-alterno2/20 to-custom-marca-boton-alterno/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-jostRegular text-lg mb-2">Aún no has realizado transacciones</p>
            <p className="text-gray-400 font-jostRegular text-sm">Tus transacciones aparecerán aquí cuando realices movimientos</p>
          </div>
        )}
        
        <div className="space-y-3">
          {pendingTransaction && (
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-jostBold text-amber-700">Transacciones pendientes</p>
              </div>
              <TransactionInfoCard
                title={pendingTransaction.title}
                subtitle={pendingTransaction.subtitle}
                tx_id={pendingTransaction.tx_id}
                tx_type={pendingTransaction.tx_type}
                tx_fee={pendingTransaction.tx_fee}
                tx_value={pendingTransaction.tx_value}
                tx_assets={pendingTransaction.tx_assets}
                block={pendingTransaction.block}
                tx_size={pendingTransaction.tx_size}
                inputUTxOs={pendingTransaction.inputUTxOs}
                outputUTxOs={pendingTransaction.outputUTxOs}
                is_collapsed={true}
                metadata={pendingTransaction.metadata}
                tx_status={pendingTransaction.tx_status}
                tx_confirmation_status={
                  pendingTransaction.tx_confirmation_status
                }
              />
            </div>
          )}
          
          {transactionsList.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-jostBold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></span>
                Historial de transacciones de billetera
              </p>
            </div>
          )}
          
          <LoadingOverlay visible={isLoading} className="space-y-3">
            {Array.isArray(transactionsList) && transactionsList.length > 0 ? (
              transactionsList
                .filter((tx: any) => tx && tx.tx_id !== pendingTransaction?.tx_id)
                .map((tx: any, index: number) => {
                  if (!tx || !tx.tx_id) {
                    console.warn('Transacción inválida en índice:', index, tx);
                    return null;
                  }
                  return (
                    <div key={tx.tx_id || index} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <TransactionInfoCard
                        title={tx.title}
                        subtitle={tx.subtitle}
                        tx_id={tx.tx_id}
                        tx_type={tx.tx_type}
                        tx_fee={tx.tx_fee}
                        tx_value={tx.tx_value}
                        tx_assets={tx.tx_assets}
                        block={tx.block}
                        tx_size={tx.tx_size}
                        inputUTxOs={tx.inputUTxOs}
                        outputUTxOs={tx.outputUTxOs}
                        is_collapsed={true}
                        metadata={tx.metadata}
                      />
                    </div>
                  );
                })
                .filter((item: any) => item !== null)
            ) : (
              !isLoading && !pendingTransaction && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm font-jostRegular">No hay transacciones para mostrar</p>
                </div>
              )
            )}
          </LoadingOverlay>
          {/* <div className="relative space-y-2 min-h-20">
            {isLoading && (
              <div
                className={`absolute top-0 left-0 w-full h-full flex items-center justify-center py-10`}
              >
                <LoadingIcon className="w-10 h-10" />
              </div>
            )}
          </div> */}
        </div>

        {/* Paginación modernizada */}
        {(canShowPrevious || canShowNext) && (
          <div className="flex flex-col items-center mt-8 pt-6 border-t border-gray-100/50">
            <div className="inline-flex rounded-lg overflow-hidden shadow-md">
              <button
                className={`flex items-center justify-center px-4 h-10 text-sm font-jostBold text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante hover:from-custom-marca-boton-variante hover:to-custom-marca-boton transition-all duration-300 ${
                  isLoading && 'cursor-progress'
                } ${!canShowPrevious ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                onClick={() => changePage(-1)}
                disabled={!canShowPrevious || isLoading}
                aria-label="Página anterior"
              >
                <svg
                  className="w-4 h-4 me-2 rtl:rotate-180"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </button>
              <div className="flex items-center justify-center px-4 h-10 text-sm font-jostBold text-white bg-gradient-to-r from-custom-marca-boton-variante to-custom-marca-boton border-l border-r border-custom-marca-boton/30">
                {paginationMetadata.currentPage}
              </div>
              <button
                className={`flex items-center justify-center px-4 h-10 text-sm font-jostBold text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante hover:from-custom-marca-boton-variante hover:to-custom-marca-boton transition-all duration-300 ${
                  isLoading && 'cursor-progress'
                } ${!canShowNext ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                onClick={() => changePage(1)}
                disabled={!canShowNext || isLoading}
                aria-label="Página siguiente"
              >
                Next
                <svg
                  className="w-4 h-4 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
