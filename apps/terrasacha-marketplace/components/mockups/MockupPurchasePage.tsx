'use client';
import EpaycoCheckout from '@marketplaces/ui-lib/src/lib/epayco/EpaycoCheckout';
import { LoadingIcon } from '@marketplaces/ui-lib/src/lib/icons/LoadingIcon';
import SignTransactionModal from '@marketplaces/ui-lib/src/lib/wallet/sign-transaction/SignTransactionModal';
import { useContext, useEffect, useRef, useState } from 'react';
import { coingeckoPrices } from '@terrasacha/utils/suan/oracle';
import { featureMapping } from '@terrasacha/utils/suan/mappings';
import {
  splitLongValues,
  txHashLink,
} from '@terrasacha/utils/generic/conversions';
import Link from 'next/link';
import { cardanoscan } from '@terrasacha/backend/mint';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { getCurrentUser } from 'aws-amplify/auth';
import ProjectInfoContext from '@terrasacha/store/projectinfo-context';
import { useRouter } from 'next/router';

const PURCHASE_STEPS = {
  BUYING: 'buying',
  PREVIEW: 'preview',
  PAYING: 'paying',
};

const PAYING_STEPS = {
  STARTING: 'starting',
  PROCESSING: 'processing',
  FINISHED: 'finished',
  ERROR: 'error',
};

export default function MockupPurchasePage() {
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [validationError, setValidationError] = useState<any>('');
  const [transactionStatusMessage, setTransactionStatusMessage] = useState<string>('');
  const [purchaseStep, setPurchaseStep] = useState<string>(PURCHASE_STEPS.BUYING);
  const [payingStep, setPayingStep] = useState<string>(PAYING_STEPS.STARTING);
  const [actualScriptId, setActualScriptId] = useState<string | null>(null);

  const { projectInfo } = useContext<any>(ProjectInfoContext);

  if (!projectInfo || !projectInfo.token) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6e6c35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-jostRegular">Cargando información del proyecto...</p>
        </div>
      </div>
    );
  }

  const {
    walletID,
    walletAddress,
    walletStakeAddress,
    walletBySuan,
    walletData,
    walletAvailableBalance,
    fetchWalletData,
  } = useContext<any>(WalletContext);

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [availableTokenAmount, setAvailableTokenAmount] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [invoiceID, setInvoiceID] = useState<string>(
    String(Math.floor(Math.random() * (3999999 - 1)) + 1)
  );

  const [alertMessage, setAlertMessage] = useState<{
    type: string;
    title: string;
    message: string;
    visible: boolean;
  }>({
    type: '',
    title: '',
    message: '',
    visible: false,
  });

  // Estados para KYC/Persona
  const [kycStatus, setKycStatus] = useState<{
    isValidatedStep1: boolean;
    isValidatedStep2: boolean;
  } | null>(null);
  const [isLoadingKYC, setIsLoadingKYC] = useState<boolean>(false);
  const [personaSDKLoaded, setPersonaSDKLoaded] = useState<boolean>(false);

  const isRouteChanging = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      isRouteChanging.current = true;
    };

    router.events?.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events?.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  // Cargar SDK de Persona
  useEffect(() => {
    const loadPersonaScript = () => {
      // Verificar si ya está cargado
      if (document.querySelector("script[src*='withpersona.com']")) {
        setPersonaSDKLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.withpersona.com/dist/persona-v5.1.2.js';
      script.integrity = 'sha384-nuMfOsYXMwp5L13VJicJkSs8tObai/UtHEOg3f7tQuFWU5j6LAewJbjbF5ZkfoDo';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        setPersonaSDKLoaded(true);
      };
      script.onerror = (error) => {
        // Error al cargar el SDK de Persona
      };
      document.body.appendChild(script);
    };

    loadPersonaScript();
  }, []);

  // Verificar estado de KYC al cargar
  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        const { userId } = await getCurrentUser();
        if (!userId) return;

        const response = await fetch(`/api/validations/validUser?userId=${userId}`);
        const validation = await response.json();
        
        if (validation) {
          // Si tiene cuenta, ya cumplió la verificación básica
          setKycStatus({
            isValidatedStep1: true,
            isValidatedStep2: validation.isValidatedStep2 || false,
          });
        }
      } catch (error) {
        setKycStatus({
          isValidatedStep1: false,
          isValidatedStep2: false,
        });
      }
    };

    checkKYCStatus();
  }, []);

  let blockFrostKeysPreview: string;
  if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
    blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
  } else {
    throw new Error(`Parameter blockFrostKeysPreview not found`);
  }

  const projectImageUrl = projectInfo.projectImage || '/images/home-page/image.png';

  const validateTokenAmount = () => {
    if (parseInt(tokenAmount) <= 0 || isNaN(parseInt(tokenAmount))) {
      toast.error('Ingresa una cantidad valida ...');
      return false;
    }
    if (!Number.isInteger(parseFloat(tokenAmount))) {
      toast.error('Ingresa una cantidad entera de tokens ...');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (alertMessage.visible) {
      setTimeout(() => {
        setAlertMessage({ type: '', title: '', message: '', visible: false });
      }, 4000);
    }
  }, [alertMessage]);

  const getAvailableTokens = async (
    spendContractAddress: string,
    tokenName: string,
    tokenContractId: string
  ) => {
    const response = await fetch('/api/calls/backend/getWalletBalanceByAddress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spendContractAddress),
    });
    const spentWalletData = await response.json();

    if (!spentWalletData) {
      toast.error('Parece que un error ha ocurrido ...');
    }

    const availableTokensAmount = spentWalletData.assets.reduce(
      (sum: number, item: any) => {
        if (item.asset_name === tokenName && item.policy_id === tokenContractId) {
          return sum + parseInt(item.quantity);
        }
      },
      0
    );
    setAvailableTokenAmount(availableTokensAmount);
    return availableTokensAmount;
  };

  useEffect(() => {
    if (projectInfo.scripts.length > 0) {
      const mintProjectTokenContract = projectInfo.scripts.find(
        (script: any) => script.script_type === 'mintProjectToken' && script.Active === true
      );
      const spendContractFromMintProjectToken = projectInfo.scripts.find(
        (script: any) => script.script_type === 'spendProject' && script.Active === true
      );

      setActualScriptId(spendContractFromMintProjectToken.id);

      if (mintProjectTokenContract && spendContractFromMintProjectToken) {
        getAvailableTokens(
          spendContractFromMintProjectToken.testnetAddr,
          mintProjectTokenContract.token_name,
          mintProjectTokenContract.id
        );
      }
    }
  }, [projectInfo]);

  useEffect(() => {
    async function getCoingeckoPrices() {
      try {
        const adaUsdMeanRate = await coingeckoPrices('cardano', projectInfo.tokenCurrency);
        setExchangeRate(adaUsdMeanRate);
      } catch (error) {
        // Error fetching exchange rate
      }
    }
    if (!exchangeRate && projectInfo.tokenCurrency) getCoingeckoPrices();
  }, [exchangeRate, projectInfo]);

  const handleSetTokenAmount = async (value: string) => {
    setValidationError('');
    
    // Solo permitir números enteros - remover cualquier punto decimal o coma
    const cleanValue = value.replace(/[.,]/g, '');
    
    // Si el valor está vacío, permitir que se limpie
    if (cleanValue === '') {
      setTokenAmount('');
      setInvestmentAmount('');
      return;
    }
    
    // Convertir a entero y validar que sea positivo
    const intValue = parseInt(cleanValue);
    if (isNaN(intValue) || intValue < 1) {
      setTokenAmount('');
      setInvestmentAmount('');
      return;
    }
    
    // Establecer el valor como entero
    setTokenAmount(String(intValue));
    
    // Calcular monto basado en la cantidad de tokens
    const price = parseFloat(projectInfo.tokenPrice);
    if (price > 0 && intValue > 0) {
      const totalAmount = intValue * price;
      setInvestmentAmount(totalAmount.toFixed(2));
    } else {
      setInvestmentAmount('');
    }
  };

  const calculatedTotalAmount = tokenAmount && parseFloat(projectInfo.tokenPrice) > 0
    ? parseFloat(tokenAmount) * parseFloat(projectInfo.tokenPrice)
    : 0;

  const validateConditions = async () => {
    try {
      const { userId } = await getCurrentUser();
      const validateUser = await validateValidUser(userId, 'crypto');
      if (!validateUser) return false;
    } catch (error) {
      Swal.fire({
        title: 'Verificación de identidad requerida',
        text: 'Debes completar una verificación de identidad antes de poder realizar una compra con criptomonedas.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6e6c35',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Verificarme ahora',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await startPersonaVerification('step2');
        }
      });
      return false;
    }

    if (!validateTokenAmount()) return false;
    if (!availableTokenAmount) {
      toast.error('Parece que ha ocurrido un error ...');
      return false;
    }
    if (availableTokenAmount < parseInt(tokenAmount)) {
      setValidationError('La cantidad de tokens que deseas comprar no se encuentra disponible');
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Ingresa una cantidad valida.',
        visible: true,
      });
      return false;
    }
    if (!tokenAmount || tokenAmount <= '0') {
      setValidationError('No has ingresado una cantidad valida');
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Ingresa una cantidad valida.',
        visible: true,
      });
      return false;
    }
    if (totalADA * 1000000 > walletAvailableBalance) {
      const rest = walletAvailableBalance / parseFloat(projectInfo.token.oraclePrice);
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: `Parece que no tienes fondos suficientes. El maximo de tokens que puedes comprar es de ${Math.floor(rest)}`,
        visible: true,
      });
      return false;
    }
    return true;
  };

  const getRates = async () => {
    const response = await fetch('/api/calls/getRates');
    const data = await response.json();
    let dataFormatted: any = {};
    data.map((item: any) => {
      let obj = `ADArate${item.currency}`;
      dataFormatted[obj] = item.value;
    });
    return dataFormatted;
  };

  const getCoreWallet = async () => {
    const response = await fetch('/api/calls/getCoreWallet');
    const data = await response.json();
    return data;
  };

  const validateValidUser = async (userId: string, paymentType: string) => {
    const response = await fetch(`/api/validations/validUser?userId=${userId}`);
    const userValidation = await response.json();
    
    if (!userValidation) return false;
    
    // Si tiene cuenta, ya cumplió la verificación básica
    if (userId) {
      userValidation.isValidatedStep1 = true;
    }
    
    // Verificar según el tipo de pago
    if (paymentType === 'fiat') {
      return userValidation.isValidatedStep1 === true;
    } else if (paymentType === 'crypto') {
      return userValidation.isValidatedStep2 === true;
    }
    
    return false;
  };

  // Función para actualizar estado de verificación en BD
  const updateVerificationStatus = async (isValidatedStep2: boolean, userId: string) => {
    try {
      const mutation = `
        mutation MyMutation {
          updateUser(input: { id: "${userId}", isValidatedStep2: ${isValidatedStep2} }) {
            id
            isValidatedStep2
          }
        }
      `;
      
      const response = await fetch(process.env.NEXT_PUBLIC_graphqlEndpoint || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_PLATAFORMA || '',
        },
        body: JSON.stringify({ query: mutation }),
      });

      const result = await response.json();
      
      // Actualizar estado local
      setKycStatus((prev) => ({
        ...prev,
        isValidatedStep2: isValidatedStep2,
      }));
    } catch (error) {
      // Error actualizando el estado de verificación
    }
  };

  // Función para iniciar verificación con Persona
  const startPersonaVerification = async (step: 'step1' | 'step2' = 'step1') => {
    if (!personaSDKLoaded) {
      toast.error('El sistema de verificación se está cargando, por favor espera un momento...');
      return;
    }

    try {
      const { userId } = await getCurrentUser();
      if (!userId) {
        toast.error('No se pudo obtener la información del usuario');
        return;
      }

      setIsLoadingKYC(true);

      if ((window as any).Persona) {
        const client = new (window as any).Persona.Client({
          templateId: 'itmpl_NdaPb1Yr2BDDy5XWXwVcEq1b8Wjy', // KYC + AML: GovID + Selfie
          environmentId: 'env_32HKp2AHU6y9PWYhmoJk4Si5EpEb',
          containerSize: 'large', // Tamaño grande del modal
          onReady: () => {
            client.open();
          },
          onComplete: async ({ inquiryId, status, fields }: any) => {
            setIsLoadingKYC(false);

            if (status === 'completed') {
              // Actualizar estado según el paso
              if (step === 'step2') {
                await updateVerificationStatus(true, userId);
              }
              
              // Refrescar estado de KYC
              const response = await fetch(`/api/validations/validUser?userId=${userId}`);
              const validation = await response.json();
              if (validation) {
                setKycStatus({
                  isValidatedStep1: true,
                  isValidatedStep2: validation.isValidatedStep2 || false,
                });
              }

              toast.success('¡Verificación completada exitosamente!');
            } else {
              toast.error('La verificación no se completó. Por favor, intenta nuevamente.');
            }
          },
          onError: (error: any) => {
            setIsLoadingKYC(false);
            toast.error('Ocurrió un error durante la verificación');
          },
          onCancel: () => {
            setIsLoadingKYC(false);
          },
        });
      } else {
        setIsLoadingKYC(false);
        toast.error('El sistema de verificación no está disponible. Por favor, recarga la página.');
      }
    } catch (error) {
      setIsLoadingKYC(false);
      toast.error('Error al iniciar la verificación');
    }
  };

  const handlePayment = async () => {
    try {
      const { userId } = await getCurrentUser();
      const validateUser = await validateValidUser(userId, 'fiat');
      if (!validateUser) {
        Swal.fire({
          title: 'Verificación de identidad requerida',
          text: 'Debes completar una verificación de identidad antes de poder realizar una compra.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#6e6c35',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Verificarme ahora',
          cancelButtonText: 'Cancelar',
        }).then(async (result) => {
          if (result.isConfirmed) {
            await startPersonaVerification('step1');
          }
        });
        return false;
      }
    } catch (error) {
      Swal.fire({
        title: 'Verificación de identidad requerida',
        text: 'Debes completar una verificación de identidad antes de poder realizar una compra.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6e6c35',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Verificarme ahora',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await startPersonaVerification('step1');
        }
      });
      return false;
    }

    if (!validateTokenAmount()) return;

    Swal.fire({
      title: 'Estas seguro de realizar la compra?',
      text: 'Seras enviado a la pasarela de pagos sin marcha atras',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6e6c35',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, quiero comprar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { userId } = await getCurrentUser();
        const rates = await getRates();
        const currencyToCryptoRate = parseFloat(
          rates[`ADArate${projectInfo.tokenCurrency.toUpperCase()}`]
        );

        let payload: any = {
          id: invoiceID,
          orderType: 'epayco',
          finalValue: parseFloat(projectInfo.tokenPrice) * parseInt(tokenAmount),
          tokenAmount: tokenAmount,
          tokenName: projectInfo.token.tokenName,
          currency: projectInfo.tokenCurrency,
          productID: projectInfo.projectID,
          userID: userId,
          walletAddress: walletAddress,
          walletStakeAddress: walletStakeAddress,
          exchangeRate: currencyToCryptoRate,
        };

        const response = await fetch('/api/calls/backend/createPayment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        await response.json();
        setShowCheckout(true);
      }
    });
  };

  const handleBuildTx = async () => {
    if (!validateTokenAmount()) return;

    const coreWallet = await getCoreWallet();
    const mintProjectTokenContract = projectInfo.scripts.find(
      (script: any) => script.script_type === 'mintProjectToken' && script.Active === true
    );
    const spendContractFromMintProjectToken = projectInfo.scripts.find(
      (script: any) => script.script_type === 'spendProject' && script.Active === true
    );

    const availableTokensAmount = await getAvailableTokens(
      spendContractFromMintProjectToken.testnetAddr,
      mintProjectTokenContract.token_name,
      mintProjectTokenContract.id
    );

    if (spendContractFromMintProjectToken) {
      const payload = {
        claim_redeemer: 'Buy',
        payload: {
          wallet_id: walletID,
          spendPolicyId: spendContractFromMintProjectToken.id,
          addresses: [
            {
              address: coreWallet.address,
              lovelace: parseInt(tokenAmount) * parseInt(projectInfo.token.oraclePrice),
              multiAsset: [],
            },
            {
              address: walletAddress,
              lovelace: 0,
              multiAsset: [
                {
                  policyid: mintProjectTokenContract.id,
                  tokens: {
                    [mintProjectTokenContract.token_name]: parseInt(tokenAmount),
                  },
                },
              ],
            },
          ],
        },
        transactionPayload: {
          walletID: walletID,
          walletAddress: walletAddress,
          productID: projectInfo.projectID,
          contractAddressOrigin: spendContractFromMintProjectToken.testnetAddr,
        },
      };

      let success = false;
      const maxRetries = 2;
      let retries = 0;

      while (!success && retries <= maxRetries) {
        if (isRouteChanging.current) break;
        try {
          const request = await fetch('/api/transactions/claim-tx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const buildTxResponse = await request.json();

          if (buildTxResponse?.success) {
            return { buildTxResponse, payload };
          } else {
            toast.error('Reintentando ...');
            throw new Error('Build transaction failed');
          }
        } catch (error: any) {
          retries += 1;
          if (retries <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 20000));
          }
        }
      }
      setPayingStep(PAYING_STEPS.ERROR);
    }
  };

  const handleCreateTransactionStep = async () => {
    const conditionValidation = await validateConditions();
    if (!conditionValidation) return;
    handleStartPaymentStep();
  };

  const handleStartPaymentStep = async () => {
    setPurchaseStep(PURCHASE_STEPS.PAYING);

    if (!walletBySuan) {
      // Billetera externa
    } else {
      setTxHash('');
      setPayingStep(PAYING_STEPS.PROCESSING);
      setTransactionStatusMessage(
        'Transacción en proceso, una ventana emergente se activará para firmar. Esperando confirmación...'
      );

      const build: any = await handleBuildTx();

      if (build && build.buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletAddress,
          buildTxResponse: build.buildTxResponse,
          metadata: {},
        });

        setNewTransactionBuild({
          ...mappedTransactionData,
          scriptId: actualScriptId,
          postDistributionPayload: {
            projectId: projectInfo.projectID,
            projectName: projectInfo.projectName,
            tokenName: projectInfo.token.tokenName,
            tokenAmount: parseInt(tokenAmount),
          },
          retryPayload: build.payload,
          transaction_id: build.buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal();
      }
    }
  };

  const handleOpenSignTransactionModal = (signStatus: boolean = false) => {
    setSignTransactionModal(!signTransactionModal);
    if (!signTransactionModal === false && !signStatus) {
      setPurchaseStep(PURCHASE_STEPS.BUYING);
    }
  };

  const filteredList = projectInfo.projectFeatures
    .filter((item: any) => featureMapping[item.featureID])
    .map((item: any) => {
      const propertyKey = featureMapping[item.featureID];
      if (propertyKey === 'D_actual_use' || propertyKey === 'F_nacimiento_agua') {
        return { [propertyKey]: JSON.parse(item.value) };
      } else {
        return { [propertyKey]: item.value };
      }
    });

  const resetSteps = () => {
    setPurchaseStep(PURCHASE_STEPS.BUYING);
    setPayingStep(PAYING_STEPS.STARTING);
    setTokenAmount('');
  };

  const steps = [
    { step: 1, title: 'Compra', description: 'Selecciona cantidad', id: PURCHASE_STEPS.BUYING },
    { step: 2, title: 'Pago', description: 'Procesa tu pago', id: PURCHASE_STEPS.PAYING },
  ];

  const subTotalUSD = parseInt(tokenAmount) * parseFloat(projectInfo.tokenPrice);
  const subTotalADA = parseFloat((subTotalUSD / exchangeRate).toFixed(4));
  const feesUSD = parseFloat((subTotalUSD * 0.05).toFixed(2));
  const feesADA = parseFloat((feesUSD / exchangeRate).toFixed(4));
  const totalUSD = subTotalUSD + feesUSD;
  const totalADA = parseFloat((totalUSD / exchangeRate).toFixed(4));

  return (
    <>
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 relative ${index < steps.length - 1 ? 'after:content-[""] after:absolute after:top-6 after:left-[60%] after:w-[80%] after:h-0.5 after:bg-gray-200' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-jostBold transition-all duration-300 ${
                    purchaseStep === step.id
                      ? 'bg-gradient-to-r from-[#6e6c35] to-[#849b50] text-white shadow-lg'
                      : steps.findIndex((s) => s.id === purchaseStep) > index
                      ? 'bg-[#b1c181] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {steps.findIndex((s) => s.id === purchaseStep) > index ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.step
                  )}
                </div>
                <h3 className="mt-2 font-jostBold text-[#44482c]">{step.title}</h3>
                <p className="text-sm text-gray-500 font-jostRegular">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* KYC Status Banner */}
        {kycStatus && (
          <>
            {!kycStatus.isValidatedStep1 && (
              <div className="p-4 bg-[#e8d79a] border border-[#6e6c35]/30 rounded-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#6e6c35] to-[#849b50] rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-jostBold text-[#44482c] mb-1 text-base">Verificación de Identidad Requerida</h3>
                    <p className="text-sm text-[#44482c] font-jostRegular mb-3 leading-relaxed">
                      Para realizar compras, necesitas completar tu verificación de identidad.
                    </p>
                    <button
                      onClick={() => startPersonaVerification('step1')}
                      disabled={isLoadingKYC || !personaSDKLoaded}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#6e6c35] to-[#849b50] hover:from-[#849b50] hover:to-[#6e6c35] text-white font-jostBold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
                    >
                      {isLoadingKYC ? 'Cargando...' : 'Verificarme Ahora'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {kycStatus.isValidatedStep1 && !kycStatus.isValidatedStep2 && (
              <div className="p-4 bg-[#b1c181]/20 border border-[#849b50]/40 rounded-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#849b50] to-[#b1c181] rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-jostBold text-[#44482c] mb-1 text-base">Verificación Completa Disponible</h3>
                    <p className="text-sm text-[#44482c] font-jostRegular mb-3 leading-relaxed">
                      Para realizar compras con criptomonedas, completa la verificación avanzada.
                    </p>
                    <button
                      onClick={() => startPersonaVerification('step2')}
                      disabled={isLoadingKYC || !personaSDKLoaded}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#6e6c35] to-[#849b50] hover:from-[#849b50] hover:to-[#6e6c35] text-white font-jostBold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
                    >
                      {isLoadingKYC ? 'Cargando...' : 'Completar Verificación'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {kycStatus.isValidatedStep1 && kycStatus.isValidatedStep2 && (
              <div className="p-3 bg-[#b1c181]/10 border border-[#849b50]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#849b50] to-[#b1c181] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-jostBold text-[#44482c]">Identidad Verificada</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Alert Message */}
        {alertMessage.visible && (
          <div className="flex items-center p-4 bg-[#e8d79a] border border-[#6e6c35]/30 rounded-xl animate-fade-in">
            <div className="flex-shrink-0 w-10 h-10 bg-[#6e6c35] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
              </svg>
            </div>
            <p className="ml-3 text-[#44482c] font-jostRegular">{alertMessage.message}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Buying Step */}
          {purchaseStep === PURCHASE_STEPS.BUYING && (
            <div className="p-6 space-y-6">
              {/* Token Info Card */}
              <div className="bg-gradient-to-r from-[#44482c] to-[#6e6c35] rounded-xl p-6 text-white">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={projectImageUrl}
                      alt="Proyecto"
                      className="w-32 h-32 rounded-xl object-cover shadow-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#b1c181] text-sm font-jostRegular">Proyecto</p>
                        <h2 className="text-xl font-jostBold">{projectInfo.projectName}</h2>
                      </div>
                      <span className="px-3 py-1 bg-[#849b50] rounded-full text-sm font-jostBold">
                        {projectInfo.token.tokenName}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <p className="text-[#b1c181] text-xs font-jostRegular">Fecha de creación</p>
                        <p className="font-jostBold text-sm">
                          {projectInfo.createdAt}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#b1c181] text-xs font-jostRegular">Tokens disponibles</p>
                        <p className="font-jostBold text-lg">
                          {projectInfo.investorTokens?.toLocaleString('es-ES') || availableTokenAmount?.toLocaleString('es-ES') || '...'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#b1c181] text-xs font-jostRegular">Precio unitario</p>
                        <p className="font-jostBold text-lg text-[#e8d79a]">
                          {parseFloat(projectInfo.tokenPrice).toLocaleString('es-ES')} {projectInfo.tokenCurrency}
                        </p>
                        <p className="text-sm text-[#b1c181]">
                          ≈ {(parseFloat(projectInfo.token.oraclePrice) / 1000000).toFixed(4)} ADA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Amount Input */}
              <div className="space-y-2">
                <label className="block text-[#44482c] font-jostBold">
                  Cantidad de tokens
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => handleSetTokenAmount(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir entrada de punto, coma, y otros caracteres no numéricos excepto números y teclas de control
                      if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Ingresa la cantidad de tokens"
                    min="1"
                    step="1"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className={`w-full px-4 py-4 rounded-xl border-2 ${
                      validationError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#6e6c35]'
                    } focus:outline-none transition-colors font-jostRegular text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6c35] font-jostBold">
                    Tokens
                  </div>
                </div>
                {validationError && (
                  <p className="text-red-500 text-sm font-jostRegular">{validationError}</p>
                )}
              </div>

              {/* Calculated Total Amount */}
              {tokenAmount && parseFloat(tokenAmount) > 0 && (
                <div className="bg-[#f8f9f3] rounded-xl p-4 border border-[#b1c181]/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#44482c]/70 text-sm font-jostRegular">Total a pagar</p>
                      <p className="text-2xl font-jostBold text-[#44482c]">
                        {calculatedTotalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {projectInfo.tokenCurrency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#44482c]/70 text-sm font-jostRegular">Precio unitario</p>
                      <p className="text-lg font-jostBold text-[#6e6c35]">
                        {parseFloat(projectInfo.tokenPrice).toLocaleString('es-ES')} {projectInfo.tokenCurrency}
                      </p>
                    </div>
                  </div>
                </div>
              )}


              {/* Payment Button */}
              <button
                onClick={() => handlePayment()}
                disabled={!kycStatus?.isValidatedStep1 || isLoadingKYC}
                className={`group relative w-full px-6 py-4 bg-gradient-to-r from-[#6e6c35] to-[#849b50] text-white font-jostBold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  !kycStatus?.isValidatedStep1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pagar
                </span>
              </button>

              {showCheckout && (
                <EpaycoCheckout
                  amount={projectInfo.tokenPrice}
                  currency={projectInfo.tokenCurrency}
                  tokenQuantity={tokenAmount}
                  tokenName={projectInfo.token.tokenName}
                  invoiceID={invoiceID}
                />
              )}
            </div>
          )}

          {/* Paying Step */}
          {purchaseStep === PURCHASE_STEPS.PAYING && (
            <div className="p-8">
              {payingStep === PAYING_STEPS.PROCESSING && (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                  <div className="w-16 h-16 border-4 border-[#6e6c35] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#44482c] font-jostRegular text-center max-w-md">
                    {transactionStatusMessage}
                  </p>
                  {txHash && (
                    <div className="bg-[#f8f9f3] rounded-xl p-6 space-y-3 w-full max-w-md border border-[#b1c181]/30">
                      <div>
                        <p className="text-sm text-gray-500 font-jostRegular">Hash de transacción</p>
                        <Link
                          href={`${cardanoscan}${txHash}`}
                          target="_blank"
                          className="text-[#6e6c35] underline font-jostBold break-all"
                        >
                          {txHashLink(txHash)}
                        </Link>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-jostRegular">Tokens por recibir</p>
                        <p className="font-jostBold text-[#44482c]">
                          {tokenAmount} ({projectInfo.token.tokenName})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {payingStep === PAYING_STEPS.FINISHED && (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#849b50] to-[#b1c181] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-jostBold text-[#44482c]">¡Transacción Exitosa!</h3>
                  <div className="bg-[#f8f9f3] rounded-xl p-6 space-y-3 w-full max-w-md border border-[#b1c181]/30">
                    <div>
                      <p className="text-sm text-gray-500 font-jostRegular">Hash de transacción</p>
                      <Link
                        href={`${cardanoscan}${txHash}`}
                        target="_blank"
                        className="text-[#6e6c35] underline font-jostBold break-all"
                      >
                        {txHashLink(txHash)}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-jostRegular">Tokens recibidos</p>
                      <p className="font-jostBold text-[#44482c] text-lg">
                        {tokenAmount} ({projectInfo.token.tokenName})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 bg-gradient-to-r from-[#6e6c35] to-[#849b50] text-white font-jostBold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Ver mis Tokens
                    </Link>
                    <button
                      onClick={resetSteps}
                      className="px-6 py-3 bg-[#e8d79a] text-[#44482c] font-jostBold rounded-xl hover:bg-[#e8d79a]/80 transition-all"
                    >
                      Comprar más
                    </button>
                  </div>
                </div>
              )}

              {payingStep === PAYING_STEPS.ERROR && (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-jostBold text-[#44482c]">Hubo un error</h3>
                  <p className="text-gray-500 font-jostRegular">Por favor intenta nuevamente</p>
                  <button
                    onClick={resetSteps}
                    className="px-6 py-3 bg-gradient-to-r from-[#6e6c35] to-[#849b50] text-white font-jostBold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Volver a intentar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="buyTokens"
        isCollapsed={false}
      />
    </>
  );
}

