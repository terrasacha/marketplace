import { useContext, useState } from 'react';
import { Card, LoadingIcon, LockIcon } from '../../ui-lib';
import SuanWalletContext from '@suan/store/suanwallet-context';

interface SignTransactionProps {
  handleOpenSignTransactionModal: () => void;
  cbor: string;
}

export default function SignTransaction(props: SignTransactionProps) {
  const { handleOpenSignTransactionModal, cbor } = props;
  const { walletID } = useContext<any>(SuanWalletContext);

  const [password, setPassword] = useState<any>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSign = async () => {
    setIsLoading(true);

    const signTxData = {
      wallet_id: walletID,
      cbor: cbor,
      password: password,
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signTxData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse.isValidUser) {
      handleOpenSignTransactionModal();
    } else {
      setPasswordError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex-col">
        <p className="font-semibold">Confirmar</p>
        <p>
          Revise la transacción antes de firmar. Ingrese la contraseña de tú
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
