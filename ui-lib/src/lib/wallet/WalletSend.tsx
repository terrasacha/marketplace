import React, { useContext, useEffect, useState } from 'react';
import SelectTokensModal from '../wallet/select-assets/SelectTokensModal'
import SignTransactionModal from '../wallet/sign-transaction/SignTransactionModal'
import Card from '../common/Card'
import {LoadingIcon} from '../icons/LoadingIcon'
import {PencilIcon} from '../icons/PencilIcon'
import Recipient from '../wallet/Recipient';
import { toast } from 'sonner';
import { WalletContext } from '@marketplaces/utils-2';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';

// Definir el tipo de 'token'
interface AccountProps {
  userWalletData: any;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function WalletSend(props: AccountProps) {
  const { walletID, walletData } = useContext<any>(WalletContext);
  const [checkedAssetList, setCheckedAssetList] = useState<Array<any>>([]);

  const handleAddCheckedAsset = (checkedAsset: any) => {
    setCheckedAssetList((prevState: any) => {
      const existingAssetIndex = prevState.findIndex(
        (asset: any) =>
          asset.fingerprint === checkedAsset.fingerprint &&
          asset.recipientID === checkedAsset.recipientID
      );

      if (existingAssetIndex !== -1) {
        // Actualizar el selectedSupply si el objeto ya existe
        const updatedAssetList = [...prevState];
        updatedAssetList[existingAssetIndex].selectedSupply =
          checkedAsset.selectedSupply;
        return updatedAssetList;
      } else {
        // Agregar el nuevo objeto al array si no existe
        return [...prevState, checkedAsset];
      }
    });
  };

  const handleRemoveCheckedAsset = (
    fingerprintToRemove: string,
    recipientIDToRemove: number
  ) => {
    setCheckedAssetList((prevState: any) => {
      const updatedAssetList = prevState.filter(
        (asset: any) =>
          asset.fingerprint !== fingerprintToRemove ||
          asset.recipientID !== recipientIDToRemove
      );
      return updatedAssetList;
    });
  };

  const newTransactionGroupInitialState = {
    recipients: [
      {
        walletAddress: '',
        adaAmount: '',
        checked: false,
        selectedAssets: [],
        error: '',
      },
    ],
    message: '',
    messageError: '',
  };
  const [newTransactionGroup, setNewTransactionGroup] = useState(
    newTransactionGroupInitialState
  );
  const [selectTokensModal, setSelectTokensModal] = useState({
    visible: false,
    data: [],
    recipientID: 0,
  });
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);

  const handleOpenSelectTokensModal = (recipientID: number = 0) => {
    setSelectTokensModal((prevState) => ({
      ...prevState,
      visible: !selectTokensModal.visible,
      recipientID: recipientID,
    }));
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const handleSetSelectedTokensToSelectTokensModal = (
    selectedTokensData: any
  ) => {
    setSelectTokensModal((prevState) => ({
      ...prevState,
      data: selectedTokensData,
    }));
  };

  const handleAddRecipientSelectedAssets = async (index: number, data: any) => {
    const payloadMultiAsset = data.map((asset: any) => {
      return {
        policyid: asset.policy_id,
        tokens: {
          [asset.assetName]: parseInt(asset.selectedSupply),
        },
      };
    });

    const destinyAddress = newTransactionGroup.recipients[index].walletAddress;
    const lovelaceValue = Math.floor(
      parseInt(newTransactionGroup.recipients[index].adaAmount) * 1000000
    );

    if (destinyAddress) {
      // Obtener min ada value
      const payload = {
        address: destinyAddress,
        lovelace: lovelaceValue ? lovelaceValue : 0,
        multiAsset: payloadMultiAsset,
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
        handleInputChange(index, 'adaAmount', String(minLovelaceValue / 1000000));
      }
    }

    console.log('Aca debo actualizar min ada', data);
    setNewTransactionGroup((prevState) => {
      const updatedRecipients = [...prevState.recipients];
      updatedRecipients[index] = {
        ...updatedRecipients[index],
        selectedAssets: data,
      };
      return {
        ...prevState,
        recipients: updatedRecipients,
      };
    });
  };

  const handleInputChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setNewTransactionGroup((prevState) => {
      const updatedRecipients = [...prevState.recipients];
      updatedRecipients[index] = {
        ...updatedRecipients[index],
        [field]: value,
      };
      return {
        ...prevState,
        recipients: updatedRecipients,
      };
    });
  };

  const handleTransactionMessageChange = (e: any) => {
    const { value } = e.target;

    setNewTransactionGroup((prevState) => {
      return {
        ...prevState,
        message: value,
      };
    });

    validateTransactionMessage(value);
  };

  const validateTransactionMessage = (transactionMessage: string) => {
    const lineBytesLimit = 64;
    let errorMessage = '';
    // Separar cadena de texto en saltos de línea
    const lines = transactionMessage.split('\n');

    // Verificar que cada línea tenga menos de 10 caracteres
    const isValid = lines.every((line, index) => {
      if (line.length > lineBytesLimit) {
        errorMessage = `Cada linea del mensaje no debe superar los ${lineBytesLimit} bytes [Fila: ${
          index + 1
        }, Bytes: ${line.length}]`;
        return false;
      }
      errorMessage = '';
      return true;
    });

    setNewTransactionGroup((prevState) => {
      return {
        ...prevState,
        messageError: errorMessage,
      };
    });

    return isValid;
  };

  const handleAddRecipient = () => {
    setNewTransactionGroup((prevState) => {
      return {
        ...prevState,
        recipients: [
          ...prevState.recipients,
          {
            walletAddress: '',
            adaAmount: '',
            checked: false,
            selectedAssets: [],
            error: '',
          },
        ],
      };
    });
  };

  const handleRemoveRecipient = (index: number) => {
    setNewTransactionGroup((prevState) => {
      const updatedRecipients = prevState.recipients.filter(
        (_, idx) => idx !== index
      );
      return {
        ...prevState,
        recipients: updatedRecipients,
      };
    });
  };

  const validateRecipients = () => {
    const recipients = newTransactionGroup.recipients;
    for (const recipient of recipients) {
      if (
        recipient.walletAddress.trim() === '' ||
        recipient.adaAmount.trim() === ''
      ) {
        return false;
      }
    }
    return true;
  };

  const handleSendTransaction = async () => {
    console.log('Transaccion: ', newTransactionGroup);
    if (!validateRecipients()) {
      toast.error('Complete todos los campos poder continuar ...');
      return;
    }
    if (newTransactionGroup.messageError) {
      toast.error(
        'Corrija los errores en el cuerpo del mensaje para poder continuar ...'
      );
      return;
    }
    setIsLoading(true);
    if (walletData) {
      // Listar addresses y valores a enviar
      const addresses = newTransactionGroup.recipients.map((recipient) => {
        const mappedMultiAssets = recipient.selectedAssets.reduce(
          (acc: any, current: any) => {
            const { policy_id, assetName, selectedSupply } = current;

            if (!acc[policy_id]) {
              acc[policy_id] = {};
            }

            acc[policy_id][assetName] = parseInt(selectedSupply, 10);

            return acc;
          },
          {}
        );
        return {
          address: recipient.walletAddress,
          lovelace: parseFloat(recipient.adaAmount) * 1000000,
          multiAsset: Object.entries(mappedMultiAssets).map(
            ([policyId, tokensObj]) => ({
              policyid: policyId,
              tokens: tokensObj,
            })
          ),
        };
      });

      const messageArray = newTransactionGroup.message
        .split('\n')
        .map((elemento) => elemento.trim())
        .filter((elemento) => elemento !== '');

      const payload = {
        wallet_id: walletID,
        addresses: addresses,
        metadata: messageArray,
      };
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
          metadata: messageArray,
        });

        setNewTransactionBuild(mappedTransactionData);
        handleOpenSignTransactionModal();
      } else {
        toast.error(
          'Algo ha salido mal, revisa las direcciones de billetera ...'
        );
      }
    }
    setIsLoading(false);
  };

  const calculateRows = (content: any) => {
    const rows = content.split('\n').length;
    return Math.min(Math.max(rows, 1), 5); // Ajusta el máximo número de filas según tus necesidades
  };

  const rows = calculateRows(newTransactionGroup.message);

  console.log(props.userWalletData);
  return (
    <>
      <div className="grid grid-cols-6 gap-5">
        <Card className="col-span-6 xl:col-span-6 h-fit">
          <Card.Header title="Nueva Transacción" />
          <Card.Body className="space-y-4">
            {newTransactionGroup.recipients.map(
              (transaction: any, index: number) => {
                return (
                  <Recipient
                    key={index}
                    index={index}
                    walletAddress={transaction.walletAddress}
                    adaAmount={transaction.adaAmount}
                    selectedAssets={transaction.selectedAssets}
                    handleInputChange={handleInputChange}
                    handleRemoveRecipient={handleRemoveRecipient}
                    handleOpenSelectTokensModal={handleOpenSelectTokensModal}
                    handleSetSelectedTokensToSelectTokensModal={
                      handleSetSelectedTokensToSelectTokensModal
                    }
                    canDelete={
                      newTransactionGroup.recipients.length > 1 ? true : false
                    }
                  />
                );
              }
            )}
            {/* Add On message */}
            <div className=" border-gray-800 border-t border-b flex-col py-4 space-y-1">
              <p className="text-xl font-semibold">
                Agrega un mensaje a la transacción
              </p>
              <p>
                Ingresa un mensaje/nota/comentario a la transacción (opcional).
                Presiona 'ENTER' para agregar una nueva linea al mensaje.
              </p>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3 pointer-events-none">
                  <PencilIcon className="w-5 h-5" />
                </div>
                <textarea
                  id="message"
                  rows={rows}
                  className={`block col-span-4 ps-10 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    newTransactionGroup.messageError &&
                    'border-red-500 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Ingresa tú mensaje"
                  value={newTransactionGroup.message}
                  onInput={handleTransactionMessageChange}
                  required
                ></textarea>
              </div>
              {newTransactionGroup.messageError && (
                <p className="text-red-500 text-xs mt-1">
                  {newTransactionGroup.messageError}
                </p>
              )}
            </div>
            {/* Footer */}
            <div className="flex justify-between">
              <button
                type="button"
                className="col-span-4 sm:col-span-1 text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
                onClick={handleAddRecipient}
              >
                Añadir destinatario
              </button>
              <button
                type="button"
                className="col-span-4 sm:col-span-1 text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
                onClick={handleSendTransaction}
              >
                {isLoading ? <LoadingIcon className="w-4 h-4" /> : 'Enviar'}
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <SelectTokensModal
        selectTokensModal={selectTokensModal}
        handleOpenSelectTokensModal={handleOpenSelectTokensModal}
        handleSetSelectedTokensToSelectTokensModal={
          handleSetSelectedTokensToSelectTokensModal
        }
        handleAddRecipientSelectedAssets={handleAddRecipientSelectedAssets}
        newTransactionGroup={newTransactionGroup}
        handleAddCheckedAsset={handleAddCheckedAsset}
        handleRemoveCheckedAsset={handleRemoveCheckedAsset}
        checkedAssetList={checkedAssetList}
      />
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="sendTransaction"
      />
    </>
  );
}
