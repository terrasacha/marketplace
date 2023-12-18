'use client';

import { useContext } from 'react';
import { Button, Card, Spinner } from 'flowbite-react';
import { OrderDetailSection } from './OrderDetailSection';
import { SelectPaymentMethodSection } from './SelectPaymentMethodSection';
import { useWallet } from '@meshsdk/react';
import { useEffect, useState } from 'react';
import { coingeckoPrices } from '../../utils/suan/oracle';
import { featureMapping } from '../../utils/suan/mappings';
import { getIpfsUrlHash } from '../../utils/generic/ipfs';
import { splitLongValues, txHashLink } from '../../utils/generic/conversions';
import ProjectInfoContext from '../../store/projectinfo-context';
import AlertMessage from '../common/AlertMessage';
import {
  createMintingTransaction,
  createTransaction,
  sign,
} from '@marketplaces/data-access';
import { cardanoscan } from '../../backend/mint';
import { BlockfrostProvider } from '@meshsdk/core';
import Link from 'next/link';

const PURCHASING_STEPS = {
  STARTING: 'starting',
  PROCESSING: 'processing',
  FINISHED: 'finished',
  ERROR: 'error',
};

export function BillingCard({
  tokenAmount,
  setValidationError,
}: {
  tokenAmount: string;
  setValidationError: (data: any) => void;
}) {
  const [step, setStep] = useState<string>(PURCHASING_STEPS.STARTING);
  const { wallet, connected } = useWallet();
  const { projectInfo } = useContext<any>(ProjectInfoContext);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [transactionStatusMessage, setTransactionStatusMessage] =
    useState<string>('En curso ...');
  const [txHash, setTxHash] = useState<string>('');
  const [tokensBuyed, setTokensBuyed] = useState<string>('');

  let blockFrostKeysPreview: string;
  if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
    blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
  } else {
    throw new Error(
      `Parameter ${process.env['blockFrostKeysPreview']} not found`
    );
  }
  const blockfrostProvider = new BlockfrostProvider(blockFrostKeysPreview);

  const [alertMessage, setAlertMessage] = useState<{
    type: string;
    title: string;
    message: string;
    visible: boolean | unknown;
  }>({
    type: '',
    title: '',
    message: '',
    visible: false,
  });

  useEffect(() => {
    async function getUserBalance() {
      try {
        const userBalance = await wallet.getBalance();
        setUserBalance(userBalance[0]['quantity']);
      } catch (error) {
        console.error(error);
      }
    }

    if (connected) {
      getUserBalance();
      setSelectedMethod('Cardano');
    } else {
      setSelectedMethod(null);
    }
  }, [connected]);

  useEffect(() => {
    async function getCoingeckoPrices() {
      try {
        const adaUsdMeanRate = await coingeckoPrices(
          'cardano',
          projectInfo.tokenCurrency
        );
        setExchangeRate(adaUsdMeanRate);
      } catch (error) {
        console.error(error);
      }
    }
    if (!exchangeRate && projectInfo.tokenCurrency) getCoingeckoPrices();
  }, [exchangeRate, projectInfo]);

  const handleClickPaymentMethod = async (paymentMethod: string) => {
    if (paymentMethod === 'CC') {
      setSelectedMethod('CC');
    }

    if (paymentMethod === 'Cardano') {
      if (connected) {
        setSelectedMethod('Cardano');
      } else {
        setOpenModal('selectWalletModal');
      }
    }
  };

  const handleClickStartPayment = async () => {
    if (!validateConditions()) {
      setTimeout(() => {
        setAlertMessage({
          type: '',
          title: '',
          message: '',
          visible: false,
        });
      }, 4000);
      return;
    }

    if (selectedMethod === 'Cardano') {
      await startMinting();
    }
    if (selectedMethod === 'CC') {
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message:
          'El metodo de pago Tarjeta de Credito no se encuentra disponible, intenta un metodo alternativo.',
        visible: true,
      });
      setTimeout(() => {
        setAlertMessage({
          type: '',
          title: '',
          message: '',
          visible: false,
        });
      }, 4000);
    }
  };

  const validateConditions = () => {
    console.log(userBalance);
    if (projectInfo.availableAmount < tokenAmount) {
      setValidationError(
        <>
          <span className="font-medium">Oops!</span> la cantidad de tokens que
          deseas comprar no se encuentra disponible
        </>
      );
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Ingresa una cantidad valida.',
        visible: true,
      });
      return false;
    }
    if (!tokenAmount || tokenAmount <= '0') {
      setValidationError(
        <>
          <span className="font-medium">Oops!</span> no has ingresado una
          cantidad valida
        </>
      );
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Ingresa una cantidad valida.',
        visible: true,
      });
      return false;
    }
    if (totalADA * 1000000 > userBalance) {
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Parece que no tienes fondos suficientes.',
        visible: true,
      });
      return false;
    }
    return true;
  };

  const filteredList = projectInfo.projectFeatures
    .filter((item: any) => featureMapping[item.featureID])
    .map((item: any) => {
      const propertyKey = featureMapping[item.featureID];
      if (
        propertyKey === 'D_actual_use' ||
        propertyKey === 'F_nacimiento_agua'
      ) {
        return { [propertyKey]: JSON.parse(item.value) };
      } else {
        return { [propertyKey]: item.value };
      }
    });

  const startMinting = async () => {
    try {
      setTxHash('');
      setStep(PURCHASING_STEPS.PROCESSING);
      setTransactionStatusMessage(
        'Transacción en proceso, una ventana emergente se activará para firmar. Esperando confirmación...'
      );
      const networkId = await wallet.getNetworkId();
      const recipientAddress = await wallet.getChangeAddress();
      const utxos = await wallet.getUtxos();
      const walletStakeID = await wallet.getRewardAddresses();

      let crypto = 'cardano';
      let base_currency = projectInfo.tokenCurrency;

      // Convert usd price to Ada price from the internal oracle

      const currencyToCryptoRate = await coingeckoPrices(crypto, base_currency);
      const adaPrice =
        parseFloat(projectInfo.tokenPrice) / currencyToCryptoRate;

      console.log('currencyToCryptoRate', currencyToCryptoRate);
      console.log('adaPrice', adaPrice);

      // Get category image from IPFS

      const IPFSUrlHash = getIpfsUrlHash(projectInfo.categoryID);

      const tokenImageUrl = `ipfs://${IPFSUrlHash}`;
      const files = [
        {
          src: tokenImageUrl,
          mediaType: 'image/png',
        },
      ];

      const metadata = {
        project_name: projectInfo.projectName,
        project_id: projectInfo.projectID,
        description: projectInfo.projectDescription,
        createdAt: projectInfo.createdAt,
        category: projectInfo.categoryID,
        files: files,
        image: tokenImageUrl,
        mediaType: 'image/png',
      };

      console.log(metadata);

      filteredList.forEach((obj2: any) => Object.assign(metadata, obj2));

      const truncated_metadata = splitLongValues(metadata);
      console.log('utxos', utxos);
      console.log('recipientAddress', recipientAddress);
      console.log('tokenAmount', tokenAmount);
      console.log('truncated_metadata', truncated_metadata);
      const { maskedTx, originalMetadata, simpleScriptPolicyID } =
        await createMintingTransaction(
          `/mint/create-tx`,
          recipientAddress,
          utxos,
          parseInt(tokenAmount),
          truncated_metadata,
          parseFloat(adaPrice.toFixed(6))
        );

      // const decodedMaskedTx = cbor.decode(maskedTx)
      // console.log(decodedMaskedTx)

      const signedTx = await wallet.signTx(maskedTx, true);
      setTransactionStatusMessage('Transacción en proceso...');

      const { appWalletSignedTx } = await sign(
        `/mint/sign`,
        signedTx,
        originalMetadata
      );

      const txHash = await wallet.submitTx(appWalletSignedTx);
      console.log(utxos);

      //8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83 token en hexadecimal
      const createTransactionPayload = {
        productID: projectInfo.projectID,
        stakeAddress: walletStakeID[0],
        policyID: simpleScriptPolicyID,
        addressDestination: recipientAddress,
        addressOrigin:
          'addr_test1vqkge7txl2vdw26efyv7cytjl8l6n8678kz09agc0r34pdss0xtmp', //Desde donde se envian los fondos al usuario ADRESS MASTER,
        amountOfTokens: parseInt(tokenAmount),
        fees: 0, //Comision,
        //metadataUrl: JSON.stringify(metadata),
        network: networkId,
        tokenName: projectInfo.tokenName,
        txCborhex: signedTx,
        txHash: txHash,
        txIn: utxos[0].input.txHash, //,
        txProcessed: true, // Si se proceso en block chain
        type: 'mint',
      };
      console.log(createTransactionPayload);
      // const createTransactionResult = await createTransaction(
      //   createTransactionPayload
      // );
      const requestOptions = {
        method: 'POST', // Método de solicitud
        headers: {
          'Content-Type': 'application/json', // Tipo de contenido del cuerpo de la solicitud
        },
        body: JSON.stringify(createTransactionPayload), // Datos que se enviarán en el cuerpo de la solicitud
      };

      const createTransactionResult = await fetch(
        '/api/calls/createTransaction',
        requestOptions
      );
      console.log('CreateTranscation: ', createTransactionResult);
      console.log('signedTx', signedTx);
      console.log('txHash', txHash);
      setTokensBuyed(tokenAmount);
      setTxHash(txHash);
      setTransactionStatusMessage(
        'Esperando confirmación de la red, por favor no abandone la pagina...'
      );
      blockfrostProvider.onTxConfirmed(txHash, async () => {
        setStep(PURCHASING_STEPS.FINISHED);
      });
    } catch (error) {
      setStep(PURCHASING_STEPS.ERROR);
      console.log(error);
    }
  };
  // Preguntar sobre la presición de los decimales a la hora de los pagos
  const subTotalUSD =
    parseInt(tokenAmount) * parseFloat(projectInfo.tokenPrice);
  const subTotalADA = parseFloat((subTotalUSD / exchangeRate).toFixed(4));
  const feesUSD = parseFloat((subTotalUSD * 0.05).toFixed(2));
  const feesADA = parseFloat((feesUSD / exchangeRate).toFixed(4));
  const totalUSD = subTotalUSD + feesUSD;
  const totalADA = parseFloat((totalUSD / exchangeRate).toFixed(4));

  return (
    <Card>
      {step === PURCHASING_STEPS.STARTING && (
        <>
          <span className="text-2xl">Detalle de la orden</span>
          <OrderDetailSection
            tokenName={projectInfo.tokenName}
            tokenPrice={projectInfo.tokenPrice}
            tokenCurrency={projectInfo.tokenCurrency}
            amount={tokenAmount}
            subTotalUSD={subTotalUSD}
            subTotalADA={subTotalADA}
            feesUSD={feesUSD}
            feesADA={feesADA}
            totalUSD={totalUSD}
            totalADA={totalADA}
            exchangeRate={exchangeRate}
            selectedMethod={selectedMethod}
          />
          <span>Metodos de pago</span>
          <SelectPaymentMethodSection
            handleClickPaymentMethod={handleClickPaymentMethod}
            openModal={openModal}
            setOpenModal={setOpenModal}
            selectedMethod={selectedMethod}
          />
          {selectedMethod && (
            <Button onClick={handleClickStartPayment}>Comprar !</Button>
          )}
          <AlertMessage
            type={alertMessage.type}
            title={alertMessage.title}
            message={alertMessage.message}
            visible={alertMessage.visible}
          ></AlertMessage>
        </>
      )}
      {step === PURCHASING_STEPS.PROCESSING && (
        <div className="grid place-items-center gap-4">
          <Spinner aria-label="Extra large spinner example" size="xl" />
          <span>{transactionStatusMessage}</span>
          {txHash && (
            <Card className="bg-gray-800 text-white w-full">
              <div>
                <span className="font-bold">Hash de la transacción: </span>
                <Link
                  className=""
                  href={`${cardanoscan}${txHash}`}
                  target="_blank"
                >
                  <span className="underline">{txHashLink(txHash)}</span>
                </Link>
              </div>
              <div>
                <span className="font-bold">Tokens por recibir: </span>
                <span>
                  {tokensBuyed} ({projectInfo.tokenName})
                </span>
              </div>
            </Card>
          )}
        </div>
      )}
      {step === PURCHASING_STEPS.FINISHED && (
        <div className="grid place-items-center gap-4">
          <span>Transaccion Finalizada</span>
          <Card className="bg-gray-800 text-white w-full">
            <div>
              <span className="font-bold">Hash de la transacción: </span>
              <Link
                className=""
                href={`${cardanoscan}${txHash}`}
                target="_blank"
              >
                <span className="underline">{txHashLink(txHash)}</span>
              </Link>
            </div>
            <div>
              <span className="font-bold">Tokens Recibidos: </span>
              <span>
                {tokenAmount} ({projectInfo.tokenName})
              </span>
            </div>
          </Card>
          <div className="flex justify-between gap-x-2">
            <Link href={'/dashboard'}>
              <Button color="success">Ver mis Tokens</Button>
            </Link>
            <Button onClick={() => setStep(PURCHASING_STEPS.STARTING)}>
              Volver a comprar
            </Button>
          </div>
        </div>
      )}
      {step === PURCHASING_STEPS.ERROR && (
        <div className="grid place-items-center gap-4">
          <span>Parece que hubo algun error</span>
          <Button onClick={() => setStep(PURCHASING_STEPS.STARTING)}>
            Volver a intentar
          </Button>
        </div>
      )}
    </Card>
  );
}
