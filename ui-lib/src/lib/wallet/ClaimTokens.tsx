import { useContext, useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';
import { SignTransactionModal } from '../ui-lib';

export default function ClaimTokens() {
  const [pendingTokensForClaiming, setPendingTokensForClaiming] = useState<any>(
    []
  );

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);

  const {
    walletID,
    walletAddress,
  } = useContext<any>(WalletContext);

  useEffect(() => {
    const fetchData = async () => {
      const { userId } = await getCurrentUser();

      const payload = {
        userId: userId,
      };

      const response = await fetch(
        'api/calls/backend/getPendingTokensForClaiming',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      setPendingTokensForClaiming(data);
    };

    fetchData();
  }, []);

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const getAvailableTokens = async (
    spendContractAddress: string,
    tokenName: string,
    tokenContractId: string
  ) => {
    const response = await fetch(
      '/api/calls/backend/getWalletBalanceByAddress',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spendContractAddress),
      }
    );
    const spentWalletData = await response.json();

    console.log('spendData', spentWalletData);
    console.log('tokenName', tokenName);
    console.log('tokenContractId', tokenContractId);

    if (!spentWalletData) {
      toast.error('Parece que un error ha ocurrido ...');
    }

    const availableTokensAmount = spentWalletData.assets.reduce(
      (sum: number, item: any) => {
        if (
          item.asset_name === tokenName &&
          item.policy_id === tokenContractId
        ) {
          return sum + parseInt(item.quantity);
        }
      },
      0
    );
    console.log('availableTokensAmount', availableTokensAmount);
    return availableTokensAmount;
  };

  const claimTokens = async (order: any) => {

    // Obtener datos del Spend y mintproject

    const mintProjectTokenContract = order.product.scripts.items.find(
      (script: any) =>
        script.script_type === 'mintProjectToken' && script.Active === true
    );

    const spendContractFromMintProjectToken = order.product.scripts.items.find(
      (script: any) =>
        script.script_type === 'spendProject' && script.Active === true
    );

    if (!spendContractFromMintProjectToken) {
      toast.error('Parece que un error ha ocurrido ...');
    }
    const availableTokensAmount = await getAvailableTokens(
      spendContractFromMintProjectToken.testnetAddr,
      mintProjectTokenContract.token_name,
      mintProjectTokenContract.id
    );

    // Función para solicitar tokens a endpoint de Luis
    console.log("order", order)
    console.log("Token Name:", mintProjectTokenContract.token_name);
    console.log("Available Tokens Amount:", availableTokensAmount);
    console.log("Order Token Amount:", parseInt(order.tokenAmount));
    
    const unlockOracleOrderPayload = {
      claim_redeemer: 'Unlist',
      payload: {
        "wallet_id": "575a7f01272dd95a9ba2696e9e3d4895fe39b12350f7fa88a301b3ad", // Id Beneficiario
        "spendPolicyId": spendContractFromMintProjectToken.id,
        "addresses": [
          {
            "address": spendContractFromMintProjectToken.testnetAddr,
            "lovelace": 0,
            "multiAsset": [
              {
                "policyid": mintProjectTokenContract.id,
                "tokens": {
                  [mintProjectTokenContract.token_name]:
                    availableTokensAmount - parseInt(order.tokenAmount),
                }
              }
            ],
            "datum": {
              "beneficiary": "575a7f01272dd95a9ba2696e9e3d4895fe39b12350f7fa88a301b3ad"
            }
          },
          {
            "address": walletAddress, // Address de usuario logeado
            "lovelace": 0,
            "multiAsset": [
              {
                "policyid": mintProjectTokenContract.id,
                "tokens": {
                  [mintProjectTokenContract.token_name]: parseInt(order.tokenAmount),
                }
              }
            ]
          }
        ]
      }
    
    }

    console.log("payload", unlockOracleOrderPayload)
    debugger
    const request = await fetch('/api/transactions/claim-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unlockOracleOrderPayload),
    });
    const buildTxResponse = await request.json();


    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: {},
      });

      const postDistributionPayload = {
        updatePayment: {
          id: order.id,
          claimedByUser: true,
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
        scriptId: spendContractFromMintProjectToken.id,
        walletId: "575a7f01272dd95a9ba2696e9e3d4895fe39b12350f7fa88a301b3ad"
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error(
        'Algo ha salido mal, revisa las direcciones de billetera ...'
      );
    }

  };

  return (
    <>
      {pendingTokensForClaiming.length > 0 && (
        <div
          id="alert-additional-content-3"
          className="p-4 mb-5 space-y-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="flex-shrink-0 w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <h3 className="text-lg font-medium">Reclama tus tokens</h3>
          </div>
          <div className="text-sm">
            Tienes ordenes de compra de tokens pendiente por reclamar
          </div>
          <ul className="list-disc list-inside">
            {pendingTokensForClaiming &&
              pendingTokensForClaiming.map(
                (pendingOrder: any, index: number) => {
                  return (
                    <li key={index} className='flex space-x-4'>
                      <p>
                        - Orden <strong>{pendingOrder.id}</strong> sin reclamar:{' '}
                        <strong>{pendingOrder.tokenName}</strong> x{' '}
                        <strong>{pendingOrder.tokenAmount}</strong>
                      </p>
                      <div>
                        <button
                          type="button"
                          className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                          onClick={() => claimTokens(pendingOrder)}
                        >
                          <svg
                            className="me-2 h-3 w-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 14"
                          >
                            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                          </svg>
                          Reclamar Tokens
                        </button>
                      </div>
                    </li>
                  );
                }
              )}
          </ul>
          <div className="flex">
          </div>
        </div>
      )}
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="unlockOrderPayment"
      />
    </>
  );
}
