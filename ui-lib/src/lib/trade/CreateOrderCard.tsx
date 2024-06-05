import { useState } from 'react';
import Card from '../common/Card';

interface CreateOrderCardProps {
  userAssetList?: Array<any>;
  walletAddress: string;
  walletStakeAddress: string;
  getOrderList: () => void;
}

interface NewOrderProps {
  asset: string;
  quantity: string;
  value: string;
}

export default function CreateOrderCard(props: CreateOrderCardProps) {
  const { userAssetList, walletAddress, walletStakeAddress, getOrderList } =
    props;

  const [newOrder, setNewOrder] = useState<NewOrderProps>({
    asset: '',
    quantity: '',
    value: '',
  });

  const [error, setError] = useState<any>({
    assetError: false,
    quantityError: false,
    valueError: false,
  });
  console.log(newOrder);

  const handleSetNewOrder = (key: string, value: string) => {
    let parsedValue = value;

    setNewOrder((prevState: any) => {
      if (key === 'quantity') {
        parsedValue = parsedValue.replace(/[^0-9]/g, '');
        validateSupply(parsedValue);
      }
      if (key === 'asset') {
        return {
          ...prevState,
          [key]: parsedValue,
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

    // Creación de orden en base de datos
    const createOrderPayload = {
      tokenName: newOrder.asset,
      tokenAmount: parseFloat(newOrder.quantity),
      walletAddress: walletAddress,
      walletStakeAddress: walletStakeAddress,
    };

    const requestOptions = {
      method: 'POST', // Método de solicitud
      headers: {
        'Content-Type': 'application/json', // Tipo de contenido del cuerpo de la solicitud
      },
      body: JSON.stringify(createOrderPayload), // Datos que se enviarán en el cuerpo de la solicitud
    };

    const createOrderResult = await fetch(
      '/api/calls/createOrder',
      requestOptions
    );

    console.log('CreateTranscation: ', createOrderResult.json());

    await getOrderList();
  };

  return (
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
              value={newOrder.asset}
            >
              <option disabled value=""></option>
              {userAssetList &&
                userAssetList.map((asset: any, index: number) => {
                  return (
                    <option key={index} value={asset.asset_name}>
                      {asset.asset_name}
                    </option>
                  );
                })}
            </select>
          </div>
          <div>
            <label htmlFor="countries" className="block mb-2 text-gray-900">
              Cantidad
            </label>
            <input
              id="adas"
              type="text"
              aria-invalid="false"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
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
              Por un valor de
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
          <div className="flex-col pt-10">
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
  );
}
