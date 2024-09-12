import { useContext, useEffect, useState } from 'react';
import Card from '../common/Card';
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
      <Card>
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="me-2">
              <a
                href="#"
                className={`${colors.fuente} inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'my_orders'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => handleSetActiveTab('my_orders')}
              >
                Mis Ordenes
              </a>
            </li>
            <li className="me-2">
              <a href="#" className={`${colors.fuente}  inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'my_orders_history'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                aria-current="page"
                onClick={() => handleSetActiveTab('my_orders_history')}
              >
                Mis Compras
              </a>
            </li>
          </ul>
        </div>
        <Card.Body>
          <>
            {activeTab === 'my_orders' && (
              <div>
                {/* Encabezado de la tabla, oculto en pantallas pequeñas */}
                <div className={`hidden md:flex space-x-2 items-center px-3 py-2`}>
                  <div className={`${colors.fuenteAlterna}  w-full text-center`}>Activo</div>
                  <div className={`${colors.fuenteAlterna}  w-full text-center`}>Cantidad</div>
                  <div className={`${colors.fuenteAlterna}  w-full text-center`}>
                    Precio Unitario (ADA)
                  </div>
                  <div className={`${colors.fuenteAlterna}  w-full text-center`}>Total</div>
                  <div className={`${colors.fuenteAlterna}  w-full text-center`}>Estado</div>
                  <div className={`${colors.fuenteAlterna}  w-full text-center`}></div>
                </div>
                <div className="space-y-1">
                  {currentItems &&
                    currentItems.map((order: any, index: number) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-wrap justify-between items-center bg-custom-dark text-white rounded-lg px-3 py-2"
                        >
                          <div className="w-full md:w-1/5 text-center">
                            <p className="md:hidden text-gray-400">Activo</p>
                            <p>{order.tokenName}</p>
                          </div>
                          <div className="w-full md:w-1/5 text-center">
                            <p className="md:hidden text-gray-400">Cantidad</p>
                            <p>{order.tokenAmount}</p>
                          </div>
                          <div className="w-full md:w-1/5 text-center">
                            <p className="md:hidden text-gray-400">
                              Precio Unitario (ADA)
                            </p>
                            <p>t₳ {order.value / 1000000}</p>
                          </div>
                          <div className="w-full md:w-1/5 text-center">
                            <p className="md:hidden text-gray-400">Total</p>
                            <p>
                              t₳ {(order.value / 1000000) * order.tokenAmount}
                            </p>
                          </div>
                          <div className="w-full md:w-1/5 text-center">
                            <p className="md:hidden text-gray-400">Estado</p>
                            <p>
                              {statusMapper[order.statusCode] || 'Sin estado'}
                            </p>
                          </div>
                          <div className="w-full md:w-1/5 text-center mt-2 md:mt-0">
                            {order.statusCode === 'listed' && (
                              <button
                                type="button"
                                className="text-yellow-300 w-full hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5"
                                onClick={() => handleRemoveOrder(order.id)}
                              >
                                Retirar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className={`flex flex-col items-center mt-5`}>
                  <span className={`${colors.fuenteAlterna}  text-sm text-gray-700 dark:text-gray-400`}>
                    Mostrando de{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {indexOfFirstItem + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.min(indexOfLastItem, totalItems)}
                    </span>{' '}
                    de un total de{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalItems}
                    </span>{' '}
                    Activos
                  </span>
                  <div className="inline-flex mt-2 xs:mt-0">
                    <button
                      className={`${colors.fuente} flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark rounded-s hover:bg-custom-dark-hover ${
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
                      className={`${colors.fuente} flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark border-0 border-s border-gray-700 rounded-e hover:bg-custom-dark-hover ${
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
              </div>
            )}
            {activeTab === 'my_orders_history' && (
              <div>
                {/* Encabezado de la tabla, oculto en pantallas pequeñas */}
                <div className="hidden md:flex space-x-2 items-center px-3 py-2">
                  <div className={`${colors.fuenteAlterna} w-full text-center`}>Activo</div>
                  <div className={`${colors.fuenteAlterna} w-full text-center`}>Cantidad</div>
                  <div className={`${colors.fuenteAlterna} w-full text-center`}>
                    Precio Unitario (ADA)
                  </div>
                  <div className={`${colors.fuenteAlterna} w-full text-center`}>Total</div>
                  <div className={`${colors.fuenteAlterna} w-full text-center`}>Estado</div>
                  <div className={`${colors.fuenteAlterna} w-full text-center`}></div>
                </div>
                <div className="space-y-1">
                  {currentItems2 &&
                    currentItems2.map((order: any, index: number) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-wrap justify-between items-center bg-custom-dark text-white rounded-lg px-3 py-2"
                        >
                          <div className={`w-full md:w-1/5 text-center`}>
                            <p className={`${colors.fuente} md:hidden text-gray-400`}>Activo</p>
                            <p>{order.tokenName}</p>
                          </div>
                          <div className={`w-full md:w-1/5 text-center`}>
                            <p className={`md:hidden text-gray-400`}>Cantidad</p>
                            <p>{order.tokenAmount}</p>
                          </div>
                          <div className={`w-full md:w-1/5 text-center`}>
                            <p className={`md:hidden text-gray-400`}>
                              Precio Unitario (ADA)
                            </p>
                            <p>t₳ {order.value / 1000000}</p>
                          </div>
                          <div className={`w-full md:w-1/5 text-center`}>
                            <p className={`md:hidden text-gray-400`}>Total</p>
                            <p>
                              t₳ {(order.value / 1000000) * order.tokenAmount}
                            </p>
                          </div>
                          <div className={`w-full md:w-1/5 text-center`}>
                            <p className={`md:hidden text-gray-400`}>Estado</p>
                            <p>Adquirido</p>
                          </div>
                          <div className={`w-full md:w-1/5 text-center mt-2 md:mt-0`}>
                            {order.statusCode === 'listed' && (
                              <button
                                type="button"
                                className={`text-yellow-300 w-full hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5`}
                                onClick={() => handleRemoveOrder(order.id)}
                              >
                                Retirar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="flex flex-col items-center mt-5">
                  <span className={`${colors.fuenteAlterna} text-sm text-gray-700 dark:text-gray-400`}>
                    Mostrando de{' '}
                    <span className={`font-semibold text-gray-900 dark:text-white`}>
                      {indexOfFirstItem2 + 1}
                    </span>{' '}
                    a{' '}
                    <span className={`${colors.fuente}  text-gray-900 dark:text-white`}>
                      {Math.min(indexOfLastItem2, totalItems2)}
                    </span>{' '}
                    de un total de{' '}
                    <span className={`${colors.fuente}  text-gray-900 dark:text-white`}>
                      {totalItems2}
                    </span>{' '}
                    Activos
                  </span>
                  <div className="inline-flex mt-2 xs:mt-0">
                    <button
                      className={`${colors.fuente} flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark rounded-s hover:bg-custom-dark-hover ${
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
                      className={`${colors.fuente} flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark border-0 border-s border-gray-700 rounded-e hover:bg-custom-dark-hover ${
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
              </div>
            )}
          </>
        </Card.Body>
      </Card>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="unlockOrder"
      />
    </>
  );
}
