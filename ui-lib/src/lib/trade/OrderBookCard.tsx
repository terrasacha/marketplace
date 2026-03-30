import { useEffect, useState } from 'react';
import { SearchIcon } from '../icons/SearchIcon';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { LoadingIcon, SignTransactionModal } from '../ui-lib';
import { toast } from 'sonner';

interface OrderBookCardProps {
  orderList: Array<any>;
  itemsPerPage: number;
  walletId: string;
  walletAddress: string;
  spendSwapId: string;
  spendSwapAddress: string
}

export default function OrderBookCard(props: OrderBookCardProps) {
  const { orderList, walletId, walletAddress, itemsPerPage, spendSwapId, spendSwapAddress } =
    props;

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orderList.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = orderList.length;
  const canShowPrevious = currentPage > 1;
  const canShowNext = indexOfLastItem < totalItems;
  console.log('orderList', orderList);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const handleRemoveOrder = async (orderId: string) => {
    const actualOrder: any = orderList?.find(
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
        spendSwapAddress: spendSwapAddress
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

  const handleBuyOrder = async (orderId: string) => {
    setLoadingStates((prevState) => ({ ...prevState, [orderId]: true }));
    
    try {
      const actualOrder: any = orderList?.find((order: any) => order.id === orderId);
      console.log('actualOrder', actualOrder);
  
      const unlockOracleOrderPayload = {
        order_side: 'Buy',
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
            {
              address: actualOrder.wallet.address,
              lovelace:
                parseInt(actualOrder.value) * parseInt(actualOrder.tokenAmount),
            },
          ],
          metadata: {},
        },
        transactionPayload: {
          walletID: walletId,
          walletAddress: walletAddress,
          productID: actualOrder.productID,
          spendSwapAddress: spendSwapAddress
        },
      };
  
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
            statusCode: 'claimed',
            walletBuyerID: walletId
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
        toast.error('Algo ha salido mal, revisa las direcciones de billetera ...');
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoadingStates((prevState) => ({ ...prevState, [orderId]: false }));
    }
  };

  /* const handleBuyOrder = async (orderId: string) => {
    const actualOrder: any = orderList?.find(
      (order: any) => order.id === orderId
    );
    console.log('actualOrder', actualOrder);
    const unlockOracleOrderPayload = {
      order_side: 'Buy',
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
          {
            address: actualOrder.wallet.address,
            lovelace:
              parseInt(actualOrder.value) * parseInt(actualOrder.tokenAmount),
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletId,
        walletAddress: walletAddress,
        productID: actualOrder.productID,
        spendSwapAddress: spendSwapAddress
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
          statusCode: 'claimed',
          walletBuyerID: walletId
        },
        // createTransaction: {
        //   productID: projectInfo.projectID,
        //   stakeAddress: walletStakeID[0],
        //   policyID: simpleScriptPolicyID,
        //   addressDestination: recipientAddress,
        //   addressOrigin:
        //     'addr_test1vqkge7txl2vdw26efyv7cytjl8l6n8678kz09agc0r34pdss0xtmp', //Desde donde se envian los fondos al usuario ADRESS MASTER,
        //   amountOfTokens: parseInt(tokenAmount),
        //   fees: parseInt(feeAmount) / 1000000, //Comision,
        //   //metadataUrl: JSON.stringify(metadata),
        //   network: networkId,
        //   tokenName: projectInfo.token.tokenName,
        //   txCborhex: signedTx,
        //   txHash: txHashValue,
        //   txIn: utxos[0].input.txHash,
        //   txProcessed: true, // Si se proceso en block chain
        //   type: 'mint',
        // },
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
 */
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
      <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 animate-scale-in" style={{ animationDelay: '0.1s' }}>
        {/* Efecto de fondo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-custom-marca-boton/5 to-transparent rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div className="pt-8 px-6 pb-6 border-b border-gray-100/50 bg-gradient-to-r from-custom-marca-boton/5 via-transparent to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-0 text-2xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent">
                    Libro de Órdenes
                  </h3>
                  <p className="mb-0 text-sm text-gray-500 font-jostRegular mt-1">
                    {totalItems > 0 ? `${totalItems} órdenes disponibles` : 'Explora y compra tokens disponibles'}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-4 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="search-asset"
                type="text"
                aria-invalid="false"
                className={`${colors.fuenteAlterna} bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton block w-full ps-12 p-4 transition-all duration-300 hover:border-custom-marca-boton/50`}
                autoComplete="off"
                placeholder="Buscar activo, cantidad o precio..."
              />
            </div>
          </div>
          <div className="p-6">
          <div>
            {currentItems && currentItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {currentItems.map((order: any, index: number) => {
                  const unitPrice = order.value / 1000000;
                  const totalPrice = unitPrice * order.tokenAmount;
                  const isMyOrder = order.walletID === walletId;
                  
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl border-2 border-gray-200 hover:border-custom-marca-boton/50 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in p-5 group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Información principal */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              isMyOrder 
                                ? 'bg-gradient-to-br from-custom-marca-boton-alterno to-custom-marca-boton-alterno2' 
                                : 'bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante'
                            }`}>
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-jostBold text-gray-900 mb-1">{order.tokenName}</h4>
                              {isMyOrder && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-custom-marca-boton-alterno/10 text-custom-marca-boton-alterno text-xs font-jostBold rounded-lg">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Mi Orden
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Detalles en grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-jostRegular text-gray-500 mb-1">Cantidad</p>
                              <p className="text-sm font-jostBold text-gray-900">{order.tokenAmount}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-jostRegular text-gray-500 mb-1">Precio Unit.</p>
                              <p className="text-sm font-jostBold text-gray-900">t₳ {unitPrice.toFixed(6)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-custom-marca-boton/10 to-custom-marca-boton-alterno2/10 rounded-lg p-3">
                              <p className="text-xs font-jostRegular text-gray-600 mb-1">Total</p>
                              <p className="text-sm font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante bg-clip-text text-transparent">
                                t₳ {totalPrice.toFixed(6)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-jostRegular text-gray-500 mb-1">Estado</p>
                              <p className="text-xs font-jostBold text-green-600 bg-green-50 px-2 py-1 rounded-lg inline-block">
                                Disponible
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botón de acción */}
                        <div className="md:w-32 flex-shrink-0">
                          {isMyOrder ? (
                            <button
                              type="button"
                              className="w-full flex justify-center items-center gap-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 font-jostBold rounded-xl text-sm px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                              onClick={() => handleRemoveOrder(order.id)}
                            >
                              {loadingStates[order.id] ? (
                                <LoadingIcon className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Retirar
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="w-full flex justify-center items-center gap-2 text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 font-jostBold rounded-xl text-sm px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                              onClick={() => handleBuyOrder(order.id)}
                            >
                              {loadingStates[order.id] ? (
                                <LoadingIcon className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Comprar
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-jostRegular text-lg mb-2">No hay órdenes disponibles</p>
                <p className="text-gray-400 font-jostRegular text-sm">Las órdenes aparecerán aquí cuando estén disponibles</p>
              </div>
            )}

            {/* Paginación mejorada */}
            {totalItems > 0 && (
              <div className="flex flex-col items-center mt-6 pt-6 border-t border-gray-100">
                <span className={`${colors.fuenteAlterna} text-sm text-gray-600 mb-4`}>
                  Mostrando <span className={`${colors.fuente} text-custom-marca-boton`}>{indexOfFirstItem + 1}</span> - <span className={`${colors.fuente} text-custom-marca-boton`}>{Math.min(indexOfLastItem, totalItems)}</span> de <span className={`${colors.fuente} text-custom-marca-boton`}>{totalItems}</span> órdenes
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
          </div>
        </div>
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="unlockOrder"
        isCollapsed={false}
      />
    </>
  );
}
