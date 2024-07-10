import React, { useContext, useState } from 'react';
import Projects from './scripts/Projects';
import Scripts from './scripts/Scripts';
import Card from '../common/Card';
import SignTransactionModal from '../wallet/sign-transaction/SignTransactionModal';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';
import { LoadingIcon } from '../ui-lib';

export default function CoreWallet(props: any) {
  const { walletID, walletData } = useContext<any>(WalletContext);
  const [oracleWalletLovelaceBalance, setOracleWalletLovelaceBalance] =
    useState<number | null>(null);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>({
    transfer: false,
    query: false,
  });
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [adaToSend, setAdaToSend] = useState<string>('');

  const getWalletBalanceByAddress = async (address: any) => {
    const balanceFetchResponse = await fetch(
      '/api/calls/backend/getWalletBalanceByAddress',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      }
    );

    const balanceData = await balanceFetchResponse.json();
    return balanceData[0].balance;
  };

  const handleGetOracleWalletLovelaceBalance = async () => {
    setIsLoading((prevState: any) => ({
      ...prevState,
      query: true,
    }));
    const lovelaceAmount = await getWalletBalanceByAddress(
      'addr_test1vrvyzwdky7hf7rqsnc3v69lr604tprdp3uyvkc0wqmrwmgqsgss8y'
    );

    setOracleWalletLovelaceBalance(lovelaceAmount);

    setIsLoading((prevState: any) => ({
      ...prevState,
      query: false,
    }));
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const handleSendTransaction = async () => {
    setIsLoading((prevState: any) => ({
      ...prevState,
      transfer: true,
    }));

    if (parseFloat(adaToSend) <= 0) {
      toast.error(
        'Debes agregar una cantidad de ADAs valida para poder enviar.'
      );
      return;
    }

    const payload = {
      wallet_id: walletID,
      addresses: [
        {
          address:
            'addr_test1vrvyzwdky7hf7rqsnc3v69lr604tprdp3uyvkc0wqmrwmgqsgss8y',
          lovelace: parseFloat(adaToSend) * 1000000,
          multiAsset: [],
          // datum: {
          //   beneficiary: 'string',
          // },
        },
      ],
      metadata: {},
    };
    if (walletData) {
      console.log('BuildTx Payload: ', payload);

      const request = await fetch('/api/transactions/build-tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const buildTxResponse = await request.json();
      console.log('BuildTx Response: ', buildTxResponse);

      if (buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletData.address,
          buildTxResponse: buildTxResponse,
          metadata: {},
        });

        setNewTransactionBuild(mappedTransactionData);
        handleOpenSignTransactionModal();
      } else {
        toast.error(
          'Algo ha salido mal, revisa las direcciones de billetera ...'
        );
      }
    }
    setIsLoading((prevState: any) => ({
      ...prevState,
      transfer: false,
    }));
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <Card>
            <Card.Header title="Billetera Oráculo" />
            <Card.Body>
              <div className="flex flex-col space-y-2">
                <div>
                  <label className="block mb-2 text-gray-900">
                    Consulta de saldo
                  </label>
                  <div className="flex space-x-2 items-center">
                    <button
                      type="button"
                      className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
                      onClick={handleGetOracleWalletLovelaceBalance}
                    >
                      {isLoading.query ? (
                        <LoadingIcon className="w-5 h-5" />
                      ) : (
                        'Consultar'
                      )}
                    </button>
                    <label
                      className={`${
                        !oracleWalletLovelaceBalance && 'hidden'
                      } text-gray-900`}
                    >
                      El saldo de la billetera Oraculo es de{' '}
                      {oracleWalletLovelaceBalance &&
                        oracleWalletLovelaceBalance / 1000000}{' '}
                      ADAs
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block mb-2 text-gray-900">
                      Recarga de ADAs a billetera Oraculo
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
                        value={adaToSend}
                        onChange={(e) => setAdaToSend(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
                    onClick={handleSendTransaction}
                  >
                    {isLoading.transfer ? (
                      <LoadingIcon className="w-5 h-5" />
                    ) : (
                      'Transferir'
                    )}
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-span-2">
          <Scripts />
        </div>
        {/* <div className="col-span-2">
          <Projects />
        </div> */}
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="sendTransaction"
      />
    </>
  );
}
