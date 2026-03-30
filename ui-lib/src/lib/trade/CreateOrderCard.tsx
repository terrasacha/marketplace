import { useEffect, useState } from 'react';
import { LoadingIcon, SignTransactionModal } from '../ui-lib';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';

interface CreateOrderCardProps {
  userAssetList?: Array<any>;
  walletId: string;
  walletAddress: string;
  walletStakeAddress: string;
  spendSwapId: string;
  getOrderList: () => void;
  spendSwapAddress: string;
}

interface NewOrderProps {
  asset: string;
  assetPolicyId: string;
  quantity: string;
  value: string;
  productId: string;
}

export default function CreateOrderCard(props: CreateOrderCardProps) {
  const {
    userAssetList,
    walletId,
    walletAddress,
    spendSwapId,
    walletStakeAddress,
    getOrderList,
    spendSwapAddress,
  } = props;

  const [newOrder, setNewOrder] = useState<NewOrderProps>({
    asset: '',
    assetPolicyId: '',
    quantity: '',
    value: '',
    productId: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log(newOrder);
  console.log('userAssetList', userAssetList);

  const [error, setError] = useState<any>({
    assetError: false,
    quantityError: false,
    valueError: false,
  });

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [selectedAssetAmount, setSelectedAssetAmount] = useState(null);

  /* useEffect(() => {
    const getMinLovelace
    if (newOrder.asset && newOrder.value && newOrder.quantity) {
      // Obtener min ada value
      const payload = {
        address: "addr_test1wzlv9shq7vysnnx3ktndesfv4zg2dzfd0gxe257mwu88e6s00jwza",
        lovelace: newOrder.value,
        multiAsset: [{
          "policyid": "string",
          "tokens": {
            "additionalProp1": 0,
            "additionalProp2": 0,
            "additionalProp3": 0
          }
        }],
      };

      const request = await fetch('/api/helpers/min-lovelace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const minLovelaceValue = await request.json();

      if (minLovelaceValue) {
        handleInputChange(
          index,
          'adaAmount',
          String(minLovelaceValue / 1000000)
        );
      }
    }
  }, [newOrder]) */

  const handleSetNewOrder = (key: string, value: string) => {
   //Colores


    
    
    let parsedValue = value;

    setNewOrder((prevState: any) => {
      if (key === 'quantity') {
        parsedValue = parsedValue.replace(/[^0-9]/g, '');
        validateSupply(parsedValue);
      }
      if (key === 'asset') {
        const asset = userAssetList?.find(
          (asset: any) => asset.policy_id === parsedValue
        );
        setSelectedAssetAmount(asset.quantity);
        return {
          ...prevState,
          [key]: asset.asset_name,
          productId: asset.productID,
          assetPolicyId: parsedValue,
          quantity: '',
          value: '',
        };
      }
      return {
        ...prevState,
        [key]: parsedValue,
      };
    });
  };

  const validateSupply = (supply: string) => {
    if (newOrder.asset !== '') {
      const selectedAssetQuantity = userAssetList?.find(
        (asset: any) => asset.asset_name === newOrder.asset
      ).quantity;
      setError((prevState: any) => {
        return {
          ...prevState,
          quantityError:
            parseInt(supply) > parseInt(selectedAssetQuantity) ? true : false,
        };
      });
    }
  };

  const handleCreateOrder = async () => {
    // Realizar proceso de envio de assets a billetera SUAN para holdearlos

    setIsLoading(true);

    // Creación de orden en endpoint Trazabilidad
    const createOracleOrderPayload = {
      order_side: 'Buy',
      payload: {
        wallet_id: walletId,
        orderPolicyId: spendSwapId,
        tokenA: {
          policy_id: newOrder.assetPolicyId,
          token_name: newOrder.asset,
        },
        qtokenA: parseInt(newOrder.quantity),
        price: parseFloat(newOrder.value) * 1000000,
        tokenB: {
          policy_id: '',
          token_name: '',
        },
        metadata: {},
      },
      transactionPayload: {
        walletID: walletId,
        walletAddress: walletAddress,
        productID: newOrder.productId,
        spendSwapAddress: spendSwapAddress,
      },
    };

    console.log('createOracleOrderPayload', createOracleOrderPayload);

    const response = await fetch('/api/transactions/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createOracleOrderPayload),
    });
    const buildTxResponse = await response.json();

    setIsLoading(false);

    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: {},
      });

      const postDistributionPayload = {
        createOrder: {
          walletID: walletId,
          scriptID: spendSwapId,
          utxos: buildTxResponse.build_tx.tx_id,
          productID: newOrder.productId,
          tokenPolicyId: newOrder.assetPolicyId,
          tokenName: newOrder.asset,
          tokenAmount: parseInt(newOrder.quantity),
          statusCode: 'listed',
          value: parseFloat(newOrder.value) * 1000000,
        },
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        postDistributionPayload,
        transaction_id: buildTxResponse.transaction_id,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error(
        'Algo ha salido mal, revisa las direcciones de billetera ...'
      );
    }
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
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
  // Calcular total estimado
  const estimatedTotal = newOrder.quantity && newOrder.value 
    ? (parseFloat(newOrder.quantity) * parseFloat(newOrder.value)).toFixed(6)
    : '0.000000';

  return (
    <>
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 animate-scale-in relative overflow-hidden">
        {/* Efecto de fondo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-custom-marca-boton/5 to-transparent rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div className="pt-8 px-6 pb-6 border-b border-gray-100/50 bg-gradient-to-r from-custom-marca-boton/5 via-transparent to-transparent">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="mb-0 text-2xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent">
                  Crear Orden de Venta
                </h3>
                <p className="mb-0 text-sm text-gray-500 font-jostRegular mt-1">Publica tus tokens en el mercado P2P</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            {/* Selector de activo mejorado */}
            <div className="space-y-2">
              <label htmlFor="asset-select" className="flex items-center gap-2 text-sm font-jostBold text-gray-700">
                <svg className="w-4 h-4 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Activo a Vender
              </label>
              <div className="relative">
                <select
                  id="asset-select"
                  className={`${colors.fuenteAlterna} bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton block w-full p-4 pr-10 transition-all duration-300 appearance-none cursor-pointer hover:border-custom-marca-boton/50`}
                  onChange={(e) => handleSetNewOrder('asset', e.target.value)}
                  value={newOrder.assetPolicyId}
                >
                  <option disabled value="">Selecciona un activo</option>
                  {userAssetList &&
                    userAssetList.map((asset: any, index: number) => {
                      return (
                        <option key={index} value={asset.policy_id}>
                          {asset.asset_name}
                        </option>
                      );
                    })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Cantidad mejorada */}
            <div className="space-y-2">
              <label htmlFor="quantity-input" className="flex items-center gap-2 text-sm font-jostBold text-gray-700">
                <svg className="w-4 h-4 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Cantidad
              </label>
              <div className="relative">
                <input
                  id="quantity-input"
                  type="text"
                  aria-invalid="false"
                  className={`${colors.fuenteAlterna} bg-white border-2 text-gray-900 text-sm rounded-xl focus:ring-2 block w-full pr-24 p-4 transition-all duration-300 ${
                    error.quantityError
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton hover:border-custom-marca-boton/50'
                  }`}
                  autoComplete="off"
                  placeholder="0"
                  value={newOrder.quantity}
                  onInput={(e) =>
                    handleSetNewOrder('quantity', e.currentTarget.value)
                  }
                  required
                />
                {newOrder.asset && (
                  <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none">
                    <span className="text-xs font-jostBold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                      Máx: {selectedAssetAmount}
                    </span>
                  </div>
                )}
              </div>
              {error.quantityError && (
                <div className="flex items-center gap-2 text-red-500 text-xs animate-fade-in">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={colors.fuente}>Fondos insuficientes</span>
                </div>
              )}
            </div>

            {/* Precio mejorado */}
            <div className="space-y-2">
              <label htmlFor="price-input" className="flex items-center gap-2 text-sm font-jostBold text-gray-700">
                <svg className="w-4 h-4 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Precio por Unidad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-4 pointer-events-none">
                  <span className="text-lg font-jostBold text-custom-marca-boton">t₳</span>
                </div>
                <input
                  id="price-input"
                  type="text"
                  aria-invalid="false"
                  className={`${colors.fuenteAlterna} bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton block w-full ps-12 p-4 transition-all duration-300 hover:border-custom-marca-boton/50`}
                  autoComplete="off"
                  placeholder="0.000000"
                  value={newOrder.value}
                  onInput={(e) =>
                    handleSetNewOrder('value', e.currentTarget.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Resumen de orden visual */}
            {(newOrder.quantity && newOrder.value && !error.quantityError) && (
              <div className="bg-gradient-to-r from-custom-marca-boton/10 via-custom-marca-boton-alterno2/5 to-transparent rounded-xl p-4 border border-custom-marca-boton/20 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-jostRegular text-gray-600 mb-1">Total Estimado</p>
                    <p className="text-xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante bg-clip-text text-transparent">
                      t₳ {estimatedTotal}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de orden */}
            {/* <div className="flex-col pt-10">
              <div className="flex justify-between mb-2">
                <p>Total Fee</p>
                <p>0</p>
              </div>
              <div className="flex justify-between text-xs">
                <p>Fee Transacción</p>
                <p>0</p>
              </div>
              <div className="flex justify-between text-xs">
                <p>Fee SUAN</p>
                <p>0</p>
              </div>
            </div>
 */}
            {/* Botón mejorado */}
            <button
              type="button"
              disabled={error.quantityError || isLoading || !newOrder.asset || !newOrder.quantity || !newOrder.value}
              className="relative flex justify-center items-center gap-3 w-full text-white bg-gradient-to-r from-custom-marca-boton via-custom-marca-boton-variante to-custom-marca-boton hover:from-custom-marca-boton-variante hover:via-custom-marca-boton hover:to-custom-marca-boton-variante focus:outline-none focus:ring-4 focus:ring-custom-marca-boton/30 font-jostBold rounded-xl text-lg px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              onClick={() => handleCreateOrder()}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              <span className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>
                    <LoadingIcon className="w-6 h-6 animate-spin" />
                    <span>Creando orden...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Crear Orden de Venta</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="createOrder"
      />
    </>
  );
}
