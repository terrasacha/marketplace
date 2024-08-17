import { useEffect, useState } from 'react';
import Card from '../common/Card';
import { SignTransactionModal } from '../ui-lib';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';

interface CreateOrderCardProps {
  userAssetList?: Array<any>;
  walletId: string;
  walletAddress: string;
  walletStakeAddress: string;
  spendSwapId: string;
  getOrderList: () => void;
  spendSwapAddress: string
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
    spendSwapAddress
  } = props;

  const [newOrder, setNewOrder] = useState<NewOrderProps>({
    asset: '',
    assetPolicyId: '',
    quantity: '',
    value: '',
    productId: '',
  });
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
        spendSwapAddress: spendSwapAddress
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

  return (
    <>
      <Card>
        <div className="flex justify-center bg-custom-dark py-6">
          <p className="text-white text-2xl font-semibold">
            Crear orden de venta
          </p>
        </div>
        <Card.Body>
          {/* Orden */}
          <div className="flex-col space-y-2">
            <div>
              <label htmlFor="countries" className="block mb-2 text-gray-900">
                Yo quiero vender
              </label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={(e) => handleSetNewOrder('asset', e.target.value)}
                value={newOrder.assetPolicyId}
              >
                <option disabled value=""></option>
                {userAssetList &&
                  userAssetList.map((asset: any, index: number) => {
                    return (
                      <option key={index} value={asset.policy_id}>
                        {asset.asset_name}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div>
              <label htmlFor="adas" className="block mb-2 text-gray-900">
                Cantidad
              </label>
              <div className="relative w-full">
                <input
                  id="adas"
                  type="text"
                  aria-invalid="false"
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full pr-16 p-2.5 ${
                    error.quantityError &&
                    'border-red-500 focus:ring-red-500 focus:border-red-500'
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
                  <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none">
                    Máx: {selectedAssetAmount}
                  </div>
                )}
              </div>
              {error.quantityError && (
                <div className="flex justify-end">
                  <p className="text-red-500 text-xs mt-1">
                    Fondos insuficientes
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="countries" className="block mb-2 text-gray-900">
                Precio (Unidad)
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                  t₳
                </div>
                <input
                  id="adas"
                  type="text"
                  aria-invalid="false"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
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
            <button
              type="button"
              disabled={error.quantityError ? true : false}
              className="flex justify-center w-full text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-semibold rounded text-lg px-3 py-3"
              onClick={() => handleCreateOrder()}
            >
              Crear orden
            </button>
          </div>
        </Card.Body>
      </Card>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="createOrder"
      />
    </>
  );
}
