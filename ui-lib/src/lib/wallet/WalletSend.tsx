import React, { useContext, useEffect, useState } from 'react';
import SelectTokensModal from '../wallet/select-assets/SelectTokensModal';
import SignTransactionModal from '../wallet/sign-transaction/SignTransactionModal';
import Card from '../common/Card';
import { LoadingIcon } from '../icons/LoadingIcon';
import { PencilIcon } from '../icons/PencilIcon';
import Recipient from '../wallet/Recipient';
import { toast } from 'sonner';
import { WalletContext } from '@marketplaces/utils-2';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { deserializeTx } from '@meshsdk/core-cst';
import { useWallet } from '@meshsdk/react';
import {
  buildTransaction,
  signAndSubmitTransaction,
} from '../common/walletApi';
import {
  BlockfrostProvider,
  MeshTxBuilder,
  MeshTxBuilderBody,
  Transaction,
} from '@meshsdk/core';

// Definir el tipo de 'token'
interface AccountProps {
  userWalletData: any;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function WalletSend(props: AccountProps) {
  const { walletID, walletAddress, walletData } =
    useContext<any>(WalletContext);

  const { wallet, connected } = useWallet();
  const [checkedAssetList, setCheckedAssetList] = useState<Array<any>>([]);

  const handleAddCheckedAsset = (checkedAsset: any) => {
    console.log('Adding checked asset: ', checkedAsset);
    setCheckedAssetList((prevState: any) => {
      const existingAssetIndex = prevState.findIndex(
        (asset: any) =>
          asset.fingerprint === checkedAsset.fingerprint &&
          asset.recipientID === checkedAsset.recipientID
      );
      console.log('Existing asset index:', existingAssetIndex);

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
    console.log(
      'Removing checked asset: ',
      fingerprintToRemove,
      recipientIDToRemove
    );
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
    console.log('Opening SelectTokensModal for recipientID:', recipientID);
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
    console.log('Setting selected tokens:', selectedTokensData);
    setSelectTokensModal((prevState) => ({
      ...prevState,
      data: selectedTokensData,
    }));
  };

  const handleAddRecipientSelectedAssets = async (index: number, data: any) => {
    console.log('Adding recipient selected assets for index:', index, data);
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
        handleInputChange(
          index,
          'adaAmount',
          String(minLovelaceValue / 1000000)
        );
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

  const meshSign = async (cbor: string) => {
    /* let blockFrostKeysPreview: string;
    if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
      blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
    } else {
      throw new Error(
        `Parameter ${process.env['blockFrostKeysPreview']} not found`
      );
    }

    const blockchainProvider = new BlockfrostProvider(blockFrostKeysPreview);

    const txBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      evaluator: blockchainProvider,
    }); */

    try {
      const tx = deserializeTx(cbor);
      console.log('tx', tx);
    } catch (error) {
      console.log(error);
    }

    /* const signedTx = await wallet.signTx(cbor); // Error
    const txHash = await wallet.submitTx(signedTx); */
  };

  const handleSendTransactionMesh = async () => {
    console.log('Transaccion: ', newTransactionGroup);

    let blockFrostKeysPreview: string;
    if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
      blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
    } else {
      throw new Error(
        `Parameter ${process.env['blockFrostKeysPreview']} not found`
      );
    }

    const blockchainProvider = new BlockfrostProvider(blockFrostKeysPreview);

    const txBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      evaluator: blockchainProvider,
    });

    const outputRecipients = newTransactionGroup.recipients;

    const messageArray = newTransactionGroup.message
      .split('\n')
      .map((elemento) => elemento.trim())
      .filter((elemento) => elemento !== '');

    // Mapear tx outputs
    const outputs = outputRecipients.map((recipient: any) => {
      const assets = recipient.selectedAssets.map((asset: any) => {
        return {
          unit: asset.fingerprint,
          quantity: asset.selectedSupply,
        };
      });
      return {
        address: recipient.walletAddress,
        amount: assets,
      };
    });

    // Agregar lovelace como output
    outputRecipients.forEach((recipient, index) => {
      outputs[index].amount.push({
        unit: 'lovelace',
        quantity: String(parseFloat(recipient.adaAmount) * 1000000),
      });
    });

    const changeAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();

    const meshTxBody: Partial<MeshTxBuilderBody> = {
      outputs: outputs,
      changeAddress: changeAddress,
      extraInputs: utxos,
      selectionConfig: {
        threshold: '5000000',
        strategy: 'keepRelevant',
        includeTxFees: true,
      },
    };

    console.log('meshTxBody', meshTxBody);

    try {
      const unsignedTx = await txBuilder.metadataValue('721', messageArray).complete(meshTxBody);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      console.log('Transaction submitted successfully', txHash);
    } catch (error: any) {
      if (error.message.includes('user declined sign tx')) {
        toast.warning(
          'Transacción finalizada, no ha sido firmada la transacción'
        );
      } else if (error.message.includes('Insufficient input in transaction')) {
        toast.warning('No hay saldo suficiente para realizar la transacción');
        console.log(error)
      } else {
        toast.error('Ha ocurrido un error desconocido');
        console.log(error)
      }
    }
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
        payload: {
          wallet_id: walletID,
          addresses: addresses,
          metadata: { '634': { msg: messageArray } },
        },
        transactionPayload: {
          walletID: walletID,
          walletAddress: walletAddress,
        },
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
        await meshSign(buildTxResponse.cbor);

        /* const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletData.address,
          buildTxResponse: buildTxResponse,
          metadata: { '634': { msg: messageArray } },
        });

        setNewTransactionBuild({
          ...mappedTransactionData,
          transaction_id: buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal(); */
      } else {
        toast.error(
          'Algo ha salido mal, revisa las direcciones de billetera ...'
        );
      }
    }
    setIsLoading(false);
  };

  const handleSendTransactionNew = async () => {
    console.log('Transaccion (nuevo método): ', newTransactionGroup);
    
    // Validar destinatarios
    if (!validateRecipients()) {
      toast.error('Complete todos los campos para poder continuar ...');
      return;
    }
    
    // Validar mensaje si hay errores
    if (newTransactionGroup.messageError) {
      toast.error(
        'Corrija los errores en el cuerpo del mensaje para poder continuar ...'
      );
      return;
    }

    // Verificar que haya walletID disponible
    if (!walletID) {
      toast.error('No se encontró la billetera. Por favor, desbloquea tu billetera.');
      return;
    }

    // Verificar si hay múltiples destinatarios (el nuevo endpoint solo acepta uno)
    if (newTransactionGroup.recipients.length > 1) {
      toast.warning(
        'El nuevo método solo soporta un destinatario a la vez. Se procesará el primer destinatario.'
      );
    }

    setIsLoading(true);

    try {
      // Obtener el primer destinatario
      const firstRecipient = newTransactionGroup.recipients[0];
      
      // Validar que tenga dirección y cantidad
      if (!firstRecipient.walletAddress.trim() || !firstRecipient.adaAmount.trim()) {
        toast.error('Complete la dirección y cantidad del destinatario');
        setIsLoading(false);
        return;
      }

      // Verificar si hay tokens seleccionados (el nuevo endpoint solo maneja ADA por ahora)
      if (firstRecipient.selectedAssets && firstRecipient.selectedAssets.length > 0) {
        toast.warning(
          'El nuevo método solo soporta transacciones de ADA. Los tokens seleccionados serán ignorados.'
        );
      }

      // Preparar metadata si hay mensaje
      const messageArray = newTransactionGroup.message
        .split('\n')
        .map((elemento) => elemento.trim())
        .filter((elemento) => elemento !== '');

      const metadata = messageArray.length > 0
        ? { msg: messageArray.join(' ') }
        : undefined;

      // Construir la transacción
      const buildPayload = {
        amount_ada: parseFloat(firstRecipient.adaAmount),
        to_address: firstRecipient.walletAddress.trim(),
        from_address_index: 0, // Usar el índice 0 por defecto
        ...(metadata && { metadata }),
      };

      console.log('Build Transaction Payload:', buildPayload);

      const buildResult = await buildTransaction(buildPayload);

      if (!buildResult.success || !buildResult.data) {
        toast.error(
          buildResult.error || 'Error al construir la transacción'
        );
        setIsLoading(false);
        return;
      }

      console.log('Build Transaction Result:', buildResult.data);

      // Mapear la transacción para mostrar en el modal
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildResult.data,
        metadata: metadata || {},
      });

      console.log('Mapped Transaction Data:', mappedTransactionData);

      // Configurar la transacción para el modal
      setNewTransactionBuild({
        ...mappedTransactionData,
        transaction_id: buildResult.data.transaction_id,
        cbor: buildResult.data.tx_cbor, // Asegurar que cbor esté disponible
      });

      // Abrir el modal de firma
      handleOpenSignTransactionModal();

    } catch (error: any) {
      console.error('Error en handleSendTransactionNew:', error);
      toast.error(
        error.message || 'Ha ocurrido un error al procesar la transacción'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRows = (content: any) => {
    const rows = content.split('\n').length;
    return Math.min(Math.max(rows, 1), 5); // Ajusta el máximo número de filas según tus necesidades
  };

  const rows = calculateRows(newTransactionGroup.message);

  console.log(props.userWalletData);
  const marketplaceName =
    process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<
    string,
    {
      bgColor: string;
      hoverBgColor: string;
      bgColorAlternativo: string;
      fuente: string;
      fuenteAlterna: string;
    }
  > = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente: 'font-jostBold',
      fuenteAlterna: 'font-jostRegular',
    },

    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor: 'bg-custom-dark',
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente: 'font-semibold',
    fuenteAlterna: 'font-medium',
  };
  return (
    <>
      <div className={`${colors.fuenteAlterna}  grid grid-cols-6 gap-5`}>
        <Card className="col-span-6 xl:col-span-6 h-fit">
          <Card.Header
            title="Nueva Transacción"
            className={`${colors.fuente}`}
          />
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
                className={`col-span-4 sm:col-span-1 text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 `}
                onClick={handleAddRecipient}
              >
                Añadir destinatario
              </button>
              <button
                type="button"
                className={`col-span-4 sm:col-span-1 text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 `}
                onClick={handleSendTransactionNew}
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
