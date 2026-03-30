import { useContext, useEffect, useState } from 'react';
import { SearchIcon, SignTransactionModal } from '../ui-lib';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';

interface OrderHistoryCardProps {
  userOrderList: Array<any>;
  purchaseList: Array<any>;
  itemsPerPage: number;
  walletId: string;
  walletAddress: string;
  spendSwapId: string;
  spendSwapAddress: string;
}

export default function OrderHistoryCard(props: OrderHistoryCardProps) {
  const {
    userOrderList,
    purchaseList,
    walletId,
    walletAddress,
    itemsPerPage,
    spendSwapId,
    spendSwapAddress,
  } = props;

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('my_orders');

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);

  // Mis Ordenes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userOrderList.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = userOrderList.length;
  const canShowPrevious = currentPage > 1;
  const canShowNext = indexOfLastItem < totalItems;

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  // Mis Compras
  const indexOfLastItem2 = currentPage2 * itemsPerPage;
  const indexOfFirstItem2 = indexOfLastItem2 - itemsPerPage;
  const currentItems2 = purchaseList.slice(indexOfFirstItem2, indexOfLastItem2);
  const totalItems2 = purchaseList.length;
  const canShowPrevious2 = currentPage2 > 1;
  const canShowNext2 = indexOfLastItem2 < totalItems2;

  console.log('userOrderList', userOrderList);
  console.log('purchaseList', purchaseList);

  const nextPage2 = () => {
    setCurrentPage2((prevPage) => prevPage + 1);
  };

  const prevPage2 = () => {
    setCurrentPage2((prevPage) => prevPage - 1);
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const handleRemoveOrder = async (orderId: string) => {
    const actualOrder: any = userOrderList?.find(
      (order: any) => order.id === orderId
    );

    const unlockOracleOrderPayload = {
      order_side: 'Unlist',
      payload: {
        wallet_id: walletId,
        orderPolicyId: spendSwapId,
        utxo: {
          transaction_id: actualOrder.utxos,
          index: 0,
        },
        addresses: [
          {
            address: walletAddress,
            lovelace: 0,
            multiAsset: [
              {
                policyid: actualOrder.tokenPolicyId,
                tokens: {
                  [actualOrder.tokenName]: parseInt(actualOrder.tokenAmount),
                },
              },
            ],
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletId,
        walletAddress: walletAddress,
        productID: actualOrder.productID,
        spendSwapAddress: spendSwapAddress,
      },
    };

    console.log('unlockOracleOrderPayload', unlockOracleOrderPayload);

    const response = await fetch('/api/transactions/unlock-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unlockOracleOrderPayload),
    });
    const buildTxResponse = await response.json();

    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: {},
      });

      const postDistributionPayload = {
        updateOrder: {
          id: actualOrder.id,
          statusCode: 'unlisted',
        },
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        postDistributionPayload,
        scriptId: spendSwapId,
        transaction_id: buildTxResponse.transaction_id,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error(
        'Algo ha salido mal, revisa las direcciones de billetera ...'
      );
    }
  };

  const statusMapper: any = {
    unlisted: 'Retirado',
    listed: 'En Venta',
    claimed: 'Vendido',
  };

  console.log(userOrderList);
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
    <>
      <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 animate-scale-in" style={{ animationDelay: '0.2s' }}>
        {/* Efecto de fondo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-custom-marca-boton-alterno/5 to-transparent rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div className="pt-8 px-6 pb-6 border-b border-gray-100/50 bg-gradient-to-r from-custom-marca-boton-alterno/5 via-transparent to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="mb-0 text-2xl font-jostBold bg-gradient-to-r from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 bg-clip-text text-transparent">
                  Historial de Órdenes
                </h3>
                <p className="mb-0 text-sm text-gray-500 font-jostRegular mt-1">Revisa tus transacciones y compras</p>
              </div>
            </div>
            
            {/* Tabs mejorados */}
            <div className="flex gap-2 bg-gray-100/50 rounded-xl p-1">
              <button
                type="button"
                className={`${colors.fuente} flex-1 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'my_orders'
                    ? 'bg-white text-custom-marca-boton shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleSetActiveTab('my_orders')}
              >
                Mis Órdenes
              </button>
              <button
                type="button"
                className={`${colors.fuente} flex-1 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'my_orders_history'
                    ? 'bg-white text-custom-marca-boton shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleSetActiveTab('my_orders_history')}
              >
                Mis Compras
              </button>
            </div>
          </div>
          <div className="p-6">
          <>
            {activeTab === 'my_orders' && (
              <div>
                {currentItems && currentItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {currentItems.map((order: any, index: number) => {
                      const unitPrice = order.value / 1000000;
                      const totalPrice = unitPrice * order.tokenAmount;
                      const statusColor = order.statusCode === 'listed' ? 'green' : order.statusCode === 'claimed' ? 'blue' : 'gray';
                      
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl border-2 border-gray-200 hover:border-custom-marca-boton-alterno/50 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in p-5 group"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 rounded-xl flex items-center justify-center shadow-md">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-jostBold text-gray-900 mb-1">{order.tokenName}</h4>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-jostBold rounded-lg ${
                                    statusColor === 'green' ? 'bg-green-50 text-green-600' :
                                    statusColor === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    'bg-gray-50 text-gray-600'
                                  }`}>
                                    {statusMapper[order.statusCode] || 'Sin estado'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-500 mb-1">Cantidad</p>
                                  <p className="text-sm font-jostBold text-gray-900">{order.tokenAmount}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-500 mb-1">Precio Unit.</p>
                                  <p className="text-sm font-jostBold text-gray-900">t₳ {unitPrice.toFixed(6)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-custom-marca-boton-alterno/10 to-custom-marca-boton-alterno2/10 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-600 mb-1">Total</p>
                                  <p className="text-sm font-jostBold bg-gradient-to-r from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 bg-clip-text text-transparent">
                                    t₳ {totalPrice.toFixed(6)}
                                  </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-500 mb-1">Fecha</p>
                                  <p className="text-xs font-jostBold text-gray-600">-</p>
                                </div>
                              </div>
                            </div>
                            
                            {order.statusCode === 'listed' && (
                              <div className="md:w-32 flex-shrink-0">
                                <button
                                  type="button"
                                  className="w-full flex justify-center items-center gap-2 text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 font-jostBold rounded-xl text-sm px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                                  onClick={() => handleRemoveOrder(order.id)}
                                >
                                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Retirar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-jostRegular text-lg mb-2">No tienes órdenes</p>
                    <p className="text-gray-400 font-jostRegular text-sm">Crea tu primera orden para comenzar</p>
                  </div>
                )}

                {/* Paginación mejorada */}
                {totalItems > 0 && (
                  <div className="flex flex-col items-center mt-6 pt-6 border-t border-gray-100">
                    <span className={`${colors.fuenteAlterna} text-sm text-gray-600 mb-4`}>
                      Mostrando <span className={`${colors.fuente} text-custom-marca-boton-alterno`}>{indexOfFirstItem + 1}</span> - <span className={`${colors.fuente} text-custom-marca-boton-alterno`}>{Math.min(indexOfLastItem, totalItems)}</span> de <span className={`${colors.fuente} text-custom-marca-boton-alterno`}>{totalItems}</span> órdenes
                    </span>
                    <div className="inline-flex gap-2">
                    <button
                      className={`${colors.fuente} flex items-center justify-center px-4 h-9 text-sm font-medium text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante rounded-l-lg hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 shadow-md hover:shadow-lg transition-all duration-300 ${
                        !canShowPrevious && 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={prevPage}
                      disabled={!canShowPrevious}
                    >
                      <svg
                        className="w-3.5 h-3.5 me-2 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 5H1m0 0 4 4M1 5l4-4"
                        />
                      </svg>
                      Prev
                    </button>
                    <button
                      className={`${colors.fuente} flex items-center justify-center px-4 h-9 text-sm font-medium text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante rounded-r-lg hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 shadow-md hover:shadow-lg transition-all duration-300 ${
                        !canShowNext && 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={nextPage}
                      disabled={!canShowNext}
                    >
                      Next
                      <svg
                        className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'my_orders_history' && (
              <div>
                {currentItems2 && currentItems2.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {currentItems2.map((order: any, index: number) => {
                      const unitPrice = order.value / 1000000;
                      const totalPrice = unitPrice * order.tokenAmount;
                      
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-white via-yellow-50/30 to-white rounded-xl border-2 border-yellow-200 hover:border-yellow-400/50 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in p-5 group"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-jostBold text-gray-900 mb-1">{order.tokenName}</h4>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-jostBold rounded-lg">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Adquirido
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-500 mb-1">Cantidad</p>
                                  <p className="text-sm font-jostBold text-gray-900">{order.tokenAmount}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-500 mb-1">Precio Unit.</p>
                                  <p className="text-sm font-jostBold text-gray-900">t₳ {unitPrice.toFixed(6)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-600 mb-1">Total Pagado</p>
                                  <p className="text-sm font-jostBold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                                    t₳ {totalPrice.toFixed(6)}
                                  </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-jostRegular text-gray-500 mb-1">Fecha</p>
                                  <p className="text-xs font-jostBold text-gray-600">-</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-jostRegular text-lg mb-2">No has realizado compras</p>
                    <p className="text-gray-400 font-jostRegular text-sm">Tus compras aparecerán aquí</p>
                  </div>
                )}

                {/* Paginación mejorada */}
                {totalItems2 > 0 && (
                  <div className="flex flex-col items-center mt-6 pt-6 border-t border-gray-100">
                    <span className={`${colors.fuenteAlterna} text-sm text-gray-600 mb-4`}>
                      Mostrando <span className={`${colors.fuente} text-yellow-600`}>{indexOfFirstItem2 + 1}</span> - <span className={`${colors.fuente} text-yellow-600`}>{Math.min(indexOfLastItem2, totalItems2)}</span> de <span className={`${colors.fuente} text-yellow-600`}>{totalItems2}</span> compras
                    </span>
                    <div className="inline-flex gap-2">
                    <button
                      className={`${colors.fuente} flex items-center justify-center px-4 h-9 text-sm font-medium text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante rounded-l-lg hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 shadow-md hover:shadow-lg transition-all duration-300 ${
                        !canShowPrevious2 && 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={prevPage2}
                      disabled={!canShowPrevious2}
                    >
                      <svg
                        className="w-3.5 h-3.5 me-2 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 5H1m0 0 4 4M1 5l4-4"
                        />
                      </svg>
                      Prev
                    </button>
                    <button
                      className={`${colors.fuente} flex items-center justify-center px-4 h-9 text-sm font-medium text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante rounded-r-lg hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 shadow-md hover:shadow-lg transition-all duration-300 ${
                        !canShowNext2 && 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={nextPage2}
                      disabled={!canShowNext2}
                    >
                      Next
                      <svg
                        className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
          </div>
        </div>
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="unlockOrder"
      />
    </>
  );
}
