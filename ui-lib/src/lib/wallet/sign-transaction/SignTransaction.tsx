import { useContext, useState } from 'react';
import { LoadingIcon } from '../../icons/LoadingIcon';
import { LockIcon } from '../../icons/LockIcon';
import { WalletContext } from '@marketplaces/utils-2';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { eventTransactionCrypto } from '../../common/event';
interface SignTransactionProps {
  handleOpenSignTransactionModal: () => void;
  pendingTx: any;
  signType: string;
}

export default function SignTransaction(props: SignTransactionProps) {
  const { handleOpenSignTransactionModal, pendingTx, signType } = props;
  const { walletID } = useContext<any>(WalletContext);

  const [password, setPassword] = useState<any>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const validateWalletPassword = async () => {
    const response = await fetch('/api/calls/backend/validateWalletPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, wallet_id: walletID }),
    });
    const passwordValidation = await response.json();

    return passwordValidation.isValidUser;
  };

  const handleSignTransactionDistributeTokens = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);
    if (signSubmitResponse?.txSubmit?.success) {
      // Actualizar un campo en tabla dynamo que indique que los tokens del proyecto han sido reclamados por el propietario o no
      // Actualizar campo token genesis
      try {
        const [updateProductResponse, createTokenResponse] = await Promise.all([
          fetch('/api/calls/backend/updateProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              pendingTx.postDistributionPayload.updateProduct
            ),
          }),
          fetch('/api/calls/backend/createToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTx.postDistributionPayload.createToken),
          }),
          // fetch('/api/transactions/oracle-datum', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify(
          //     pendingTx.postDistributionPayload.createOracleDatum
          //   ),
          // }),
        ]);

        const productUpdatedResponse = await updateProductResponse.json();
        const createTokenResponseData = await createTokenResponse.json();
        // const createOracleDatumResponseData = await createOracleDatumResponse.json();

        console.log('Actualización del producto:', productUpdatedResponse);
        console.log('Creación del token:', createTokenResponseData);
        // console.log(
        //   'Creación precio en oraculo:',
        //   createOracleDatumResponseData
        // );
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSignTransactionBuyTokens = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);
    // if (signSubmitResponse?.txSubmit?.success) {
    // }

    return signSubmitResponse;
  };

  const handleSignTransactionSendTransaction = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);
    return signSubmitResponse;
  };

  const handleSignTransactionCreateOrder = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse?.txSubmit?.success) {
      // Actualizar un campo en tabla dynamo que indique que los tokens del proyecto han sido reclamados por el propietario o no
      // Actualizar campo token genesis
      try {
        const [createOrderResponse] = await Promise.all([
          fetch('/api/calls/createOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTx.postDistributionPayload.createOrder),
          }),
        ]);

        const createOrderResponseData = await createOrderResponse.json();

        console.log('Creación de la orden:', createOrderResponseData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSignTransactionUnlockOrder = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse?.txSubmit?.success) {
      try {
        const [updateOrderResponse] = await Promise.all([
          fetch('/api/calls/updateOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTx.postDistributionPayload.updateOrder),
          }),
        ]);

        const updateOrderResponseData = await updateOrderResponse.json();

        console.log('Actualizacion de la orden:', updateOrderResponseData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSignTransactionUnlockOrderPayment = async () => {
    const confirmSubmitData = {
      wallet_id: pendingTx.walletId,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse?.txSubmit?.success) {
      try {
        const [updatePaymentResponse] = await Promise.all([
          fetch('/api/calls/backend/updatePaymentClaimedStatus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              pendingTx.postDistributionPayload.updatePayment
            ),
          }),
        ]);

        const updatePaymentResponseData = await updatePaymentResponse.json();

        console.log('Actualizacion de el pago:', updatePaymentResponseData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSign = async () => {
    setIsLoading(true);

    const isValidUser = await validateWalletPassword();

    if (!isValidUser) {
      setPasswordError(true);
      setIsLoading(false);
      return;
    }

    let signSubmitResponse;
    let data
    console.log('pendingTx', pendingTx);

    if (signType === 'distributeTokens') {
      signSubmitResponse = await handleSignTransactionDistributeTokens();
    }

    if (signType === 'buyTokens') {
      data = pendingTx.postDistributionPayload // Esta variable contiene la info almacenada en  --> PaymentPage:609 || Gracias bro. Sign: 🧙‍♂️
      signSubmitResponse = await handleSignTransactionBuyTokens();
    }

    if (signType === 'sendTransaction') {
      signSubmitResponse = await handleSignTransactionSendTransaction();
    }

    if (signType === 'createOrder') {
      signSubmitResponse = await handleSignTransactionCreateOrder();
    }

    if (signType === 'unlockOrder') {
      signSubmitResponse = await handleSignTransactionUnlockOrder();
    }

    if (signType === 'unlockOrderPayment') {
      signSubmitResponse = await handleSignTransactionUnlockOrderPayment();
    }

    // Crear transacción

    if (signSubmitResponse?.txSubmit?.success) {
      //analytics

      if(signType === "buyTokens") {
        eventTransactionCrypto({
          action: 'buy_token',
          category: 'marketplace',
          label: `Token from project ${data.projectName} purchased`,
          token: data.tokenName, 
          amount: data.tokenAmount
        });
      }
      handleOpenSignTransactionModal();
      toast.success('Seras redirigido en unos instantes...');
      localStorage.setItem('pendingTx', JSON.stringify(pendingTx));

      setTimeout(() => {
        router.push({
          pathname: '/wallet/transactions',
        });
      }, 3000);
    } else {
      toast.error('Ha ocurrido un error al intentar realizar la transacción');
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex-col">
        <p className="font-semibold">Confirmar</p>
        <p>
          Revise la transacción antes de firmar. Ingrese la contraseña de su
          billetera.
        </p>
      </div>
      <hr />
      <div className="flex-col">
        <p className="font-semibold">Firmar</p>
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3 pointer-events-none">
            <LockIcon className="w-5 h-5" />
          </div>
          <input
            type="password"
            aria-invalid="false"
            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 ${
              passwordError &&
              'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
            }`}
            autoComplete="off"
            placeholder="Ingresa la contraseña de tu wallet"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {passwordError && (
          <p className="text-red-500 text-xs mt-1">Contraseña incorrecta</p>
        )}
      </div>
      <hr />
      <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
        <button
          type="button"
          className="flex justify-center w-full md:w-1/4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
          onClick={handleOpenSignTransactionModal}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="flex justify-center w-full md:w-1/4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
          onClick={handleSign}
        >
          {isLoading ? <LoadingIcon className="w-4 h-4" /> : 'Firmar'}
        </button>
      </div>
      <hr />
    </div>
  );
}
