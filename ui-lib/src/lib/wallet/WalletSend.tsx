import React, { useContext, useEffect, useState } from 'react';
import SelectTokensModal from '../wallet/select-assets/SelectTokensModal';
import SignTransactionModal from '../wallet/sign-transaction/SignTransactionModal';
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

      try {
        const request = await fetch('/api/helpers/min-lovelace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!request.ok) {
          const errorData = await request.json().catch(() => ({}));
          console.error('Error al calcular min lovelace:', errorData);
          toast.error(
            errorData.error || 'Error al calcular el mínimo de ADA requerido'
          );
          return;
        }

        const responseData = await request.json();

        // Manejar respuesta: puede ser { min_lovelace, min_ada } o un número
        let minLovelaceValue;
        if (typeof responseData === 'object' && responseData !== null) {
          // Si es un objeto, extraer min_lovelace
          minLovelaceValue = responseData.min_lovelace || responseData.minLovelace;
        } else if (typeof responseData === 'number') {
          // Si es un número, usarlo directamente
          minLovelaceValue = responseData;
        } else {
          console.warn('Formato de respuesta inesperado:', responseData);
          return;
        }

        if (minLovelaceValue && typeof minLovelaceValue === 'number' && minLovelaceValue > 0) {
          const minAdaValue = minLovelaceValue / 1000000;
          handleInputChange(
            index,
            'adaAmount',
            String(minAdaValue)
          );
        }
      } catch (error) {
        console.error('Error al obtener min lovelace:', error);
        toast.error('Error al calcular el mínimo de ADA requerido');
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

      // Inicializar amount_ada final (puede ser actualizado si hay assets)
      let finalAdaAmount = parseFloat(firstRecipient.adaAmount) || 0;

      // Preparar assets si hay tokens seleccionados
      let assetsArray: Array<{ policyid: string; tokens: { [key: string]: number } }> = [];

      if (firstRecipient.selectedAssets && firstRecipient.selectedAssets.length > 0) {
        // Agrupar assets por policy_id según el formato esperado por el API
        const assetsByPolicy = firstRecipient.selectedAssets.reduce((acc: any, asset: any) => {
          const policyId = asset.policy_id;
          
          if (!policyId) {
            console.warn('Asset sin policy_id:', asset);
            return acc;
          }
          
          if (!acc[policyId]) {
            acc[policyId] = {
              policyid: policyId,
              tokens: {}
            };
          }
          
          // Agregar token al policy (puede haber múltiples tokens del mismo policy)
          const tokenName = asset.assetName;
          const tokenQuantity = parseInt(asset.selectedSupply, 10);
          
          if (tokenName && !isNaN(tokenQuantity) && tokenQuantity > 0) {
            // Si ya existe el token, sumar las cantidades
            if (acc[policyId].tokens[tokenName]) {
              acc[policyId].tokens[tokenName] += tokenQuantity;
            } else {
              acc[policyId].tokens[tokenName] = tokenQuantity;
            }
          }
          
          return acc;
        }, {});
        
        // Convertir objeto a array
        assetsArray = Object.values(assetsByPolicy);
        
        console.log('Assets a enviar:', assetsArray);

        // Validar que el amount_ada sea suficiente cuando hay assets
        
        try {
          const currentAdaAmount = finalAdaAmount;
          const currentLovelaceValue = Math.floor(currentAdaAmount * 1000000);

          // Calcular min lovelace requerido
          const minLovelacePayload = {
            address: firstRecipient.walletAddress.trim(),
            lovelace: currentLovelaceValue,
            multiAsset: assetsArray,
          };

          const minLovelaceRequest = await fetch('/api/helpers/min-lovelace', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(minLovelacePayload),
          });

          if (minLovelaceRequest.ok) {
            const minLovelaceResponse = await minLovelaceRequest.json();
            
            // Manejar respuesta: puede ser { min_lovelace, min_ada } o un número
            let minLovelaceValue;
            if (typeof minLovelaceResponse === 'object' && minLovelaceResponse !== null) {
              minLovelaceValue = minLovelaceResponse.min_lovelace || minLovelaceResponse.minLovelace;
            } else if (typeof minLovelaceResponse === 'number') {
              minLovelaceValue = minLovelaceResponse;
            }

            if (minLovelaceValue && typeof minLovelaceValue === 'number') {
              const minAdaRequired = minLovelaceValue / 1000000;
              
              // Si el amount_ada actual es menor al mínimo requerido, usar el mínimo
              if (currentAdaAmount < minAdaRequired) {
                console.log(`Actualizando amount_ada de ${currentAdaAmount} a ${minAdaRequired} (mínimo requerido)`);
                
                // Actualizar el estado del destinatario para reflejar el cambio en la UI
                setNewTransactionGroup((prevState) => {
                  const updatedRecipients = [...prevState.recipients];
                  updatedRecipients[0] = {
                    ...updatedRecipients[0],
                    adaAmount: String(minAdaRequired),
                  };
                  return {
                    ...prevState,
                    recipients: updatedRecipients,
                  };
                });

                // Usar el min ada requerido para la transacción (importante: usar este valor directamente)
                finalAdaAmount = minAdaRequired;
              }
            }
          } else {
            const errorData = await minLovelaceRequest.json().catch(() => ({}));
            console.warn('No se pudo calcular min lovelace:', errorData);
            toast.warning('No se pudo validar el mínimo de ADA requerido. La transacción podría fallar.');
          }
        } catch (error) {
          console.error('Error al validar min lovelace:', error);
          toast.warning('Error al validar el mínimo de ADA. La transacción podría fallar.');
          // Continuar con el amount_ada actual si falla la validación
        }
      }

      // Preparar metadata si hay mensaje
      const messageArray = newTransactionGroup.message
        .split('\n')
        .map((elemento) => elemento.trim())
        .filter((elemento) => elemento !== '');

      const metadata = messageArray.length > 0
        ? { msg: messageArray.join(' ') }
        : undefined;

      // Construir la transacción con assets si están presentes
      // IMPORTANTE: Usar finalAdaAmount que puede haber sido actualizado por la validación
      const buildPayload = {
        amount_ada: finalAdaAmount,
        to_address: firstRecipient.walletAddress.trim(),
        from_address_index: 0, // Usar el índice 0 por defecto
        ...(metadata && { metadata }),
        // Incluir assets si hay alguno seleccionado
        ...(assetsArray.length > 0 && { assets: assetsArray }),
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
      <div className={`${colors.fuenteAlterna} grid grid-cols-6 gap-5`}>
        <div className="col-span-6 xl:col-span-6 h-fit bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 animate-scale-in">
          <div className="pt-6 px-6 pb-4 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h3 className="mb-0 text-2xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent">Nueva Transacción</h3>
                <p className="mb-0 text-sm text-gray-500 font-jostRegular">Completa los datos para enviar</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
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
            <div className="border-t border-b border-gray-200/50 bg-gradient-to-r from-custom-marca-boton-alterno2/5 to-custom-marca-boton-alterno/5 flex-col py-6 px-4 space-y-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-lg flex items-center justify-center">
                  <PencilIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-jostBold text-gray-800">
                  Agrega un mensaje a la transacción
                </p>
              </div>
              <p className="text-sm text-gray-600 font-jostRegular">
                Ingresa un mensaje/nota/comentario a la transacción (opcional).
                Presiona 'ENTER' para agregar una nueva linea al mensaje.
              </p>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3 pointer-events-none">
                  <PencilIcon className="w-5 h-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  rows={rows}
                  className={`block col-span-4 ps-10 p-3 w-full text-sm text-gray-900 bg-white rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton ${
                    newTransactionGroup.messageError
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200'
                  }`}
                  placeholder="Ingresa tú mensaje"
                  value={newTransactionGroup.message}
                  onInput={handleTransactionMessageChange}
                  required
                ></textarea>
              </div>
              {newTransactionGroup.messageError && (
                <p className="text-red-500 text-xs mt-1 font-jostRegular animate-fade-in">
                  {newTransactionGroup.messageError}
                </p>
              )}
            </div>
            {/* Footer */}
            <div className="flex justify-between gap-4 pt-4 border-t border-gray-100/50">
              <button
                type="button"
                className="relative text-white bg-gradient-to-r from-custom-marca-boton-alterno2 to-custom-marca-boton-alterno hover:from-custom-marca-boton-alterno hover:to-custom-marca-boton-alterno2 focus:outline-none focus:ring-2 focus:ring-custom-marca-boton-alterno/20 font-jostBold rounded-lg text-sm px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                onClick={handleAddRecipient}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir destinatario
                </span>
              </button>
              <button
                type="button"
                className="relative text-white bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 font-jostBold rounded-lg text-sm px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendTransactionNew}
                disabled={isLoading}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <LoadingIcon className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
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
