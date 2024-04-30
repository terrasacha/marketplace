import { useRouter } from 'next/router';
import { Card, PlusIcon, SignTransactionModal } from '../../ui-lib';
import ScriptsList from './ScriptsList';
import { useContext, useEffect, useState } from 'react';
import CreateScriptModal from './CreateScriptModal';
import MintModal from './MintModal';
import { toast } from 'sonner';
import {
  WalletContext,
  getActualPeriod,
  mapBuildTransactionInfo,
} from '@marketplaces/utils-2';
import Swal from 'sweetalert2';
import { coingeckoPrices } from '@marketplaces/data-access';

export default function Scripts(props: any) {
  const { walletID, walletAddress } = useContext<any>(WalletContext);
  const [scripts, setScripts] = useState<Array<any>>([]);
  const [createScriptModal, setCreateScriptModal] = useState<boolean>(false);
  const [mintModal, setMintModal] = useState<boolean>(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);

  const getCoreWalletData = async () => {
    const request = await fetch('/api/contracts/get-scripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await request.json();
    console.log('scripts', responseData);

    setScripts(responseData);
  };

  useEffect(() => {
    getCoreWalletData();
  }, []);

  const handleOpenCreateScriptModal = () => {
    setCreateScriptModal(!createScriptModal);
  };
  const handleOpenMintModal = (policyId: string | null = null) => {
    setSelectedScript(policyId);
    setMintModal(!mintModal);
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
    if (!signTransactionModal === false) {
      toast.error('Tokens no enviados ...');
    }
  };

  const handleDeleteScript = async (
    policyId: string | null = null,
    newStatus: boolean
  ): Promise<boolean> => {
    // Si el contrato que se envia es un contrato padre, eliminar todos sus hijos
    const actualScript = scripts.find((script: any) => script.id === policyId);

    const payload = {
      policyID: policyId,
      newStatus,
    };

    const response = await fetch(`/api/calls/backend/deleteScriptById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const deleteData = await response.json();

    for (let index = 0; index < actualScript.scripts.items.length; index++) {
      const subScript = actualScript.scripts.items[index];
      await handleDeleteScript(subScript.id, newStatus);
    }

    if (actualScript.scriptParentID === 'undefined') {
      await getCoreWalletData();
    }

    return deleteData.data;
  };

  const getProjectTokenDistribution = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const tokenAmountDistribution = JSON.parse(
        productFeatures.filter((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION';
        })[0]?.value || '{}'
      );

      return tokenAmountDistribution;
    } else {
      return false;
    }
  };

  const getProjectTokenData = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const tokenCurrency =
        productFeatures.find((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
        })?.value || '{}';

      const tokenHistoricalData: any[] = JSON.parse(
        productFeatures.filter((item: any) => {
          return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
        })[0]?.value || '[]'
      );

      const periods: any[] = tokenHistoricalData.map((tkhd: any) => {
        return {
          period: tkhd.period,
          date: new Date(tkhd.date),
          price: tkhd.price,
          amount: tkhd.amount,
        };
      });


      const actualPeriod: any = getActualPeriod(Date.now(), periods);

      return {
        actualTokenPrice: actualPeriod.price,
        tokenCurrency: tokenCurrency,
      };
    }
    return {
      actualTokenPrice: null,
      tokenCurrency: null,
    };
  };

  const checkOwnerWallet = (projectData: any) => {
    const constructorUser = projectData.userProducts.items.find(
      (item: any) => item.user.role === 'constructor'
    );

    if (constructorUser) {
      const { wallets } = constructorUser.user;
      if (wallets.items.length > 0) {
        return wallets.items[0].address;
      }
    }

    return false;
  };

  const getRates = async () => {
    const response = await fetch('/api/calls/getRates');
    const data = await response.json();
    let dataFormatted: any = {};
    data.map((item: any) => {
      let obj = `ADArate${item.currency}`;
      dataFormatted[obj] = item.value.toFixed(4);
    });
    return dataFormatted;
  };

  const getTokenLovelacePrice = async (projectData: any) => {
    const rates = await getRates();

    const { actualTokenPrice, tokenCurrency } =
      getProjectTokenData(projectData);

    const currencyToCryptoRate = parseFloat(
      rates[`ADArate${tokenCurrency.toUpperCase()}`]
    );

    if (actualTokenPrice && tokenCurrency && currencyToCryptoRate) {
      console.log('actualTokenPrice', actualTokenPrice);
      console.log('tokenCurrency', tokenCurrency);
      console.log('currencyToCryptoRate', currencyToCryptoRate);
      const adaTokenPrice = parseFloat(actualTokenPrice) / currencyToCryptoRate;
      console.log('adaTokenPrice', adaTokenPrice);
      return Math.trunc(adaTokenPrice * 1000000);
    }

    return false;
  };

  const getCoreWallet = async () => {
    const response = await fetch('/api/calls/getCoreWallet');
    const data = await response.json();
    console.log('coreWallet', data);
    return data;
  };

  const handleDistributeTokens = async (policyId: string | null = null) => {
    const actualScript = scripts.find((script: any) => script.id === policyId);

    // Obtener corewallet
    const coreWallet = await getCoreWallet();

    let mapStakeHolders: any = {
      bioc: 'addr_test1vqx420pm9cx326rh0q8yx6u4h72ae56l9ekzk05m8w9qe3cz5swj5',
      administrador: coreWallet.address, // Addres de billetera unica tipo corewallet
      buffer: 'addr_test1vqs34z4ljy3c6u3s97m64zqz7f0ks6vtre2dcpl5um8wz2qgaxq8z',
      comunidad:
        'addr_test1vqvx6mm487nkkpavyf7sqflgavutajq8veer5wmy0nwlgyg27rsqk',
      // propietario: ...
      // inversionista: ...
    };

    // Obtener address de inversionista del spend

    const spendFromActualScript = scripts.find(
      (script: any) =>
        script.productID === actualScript.productID &&
        script.script_type === 'spend'
    );

    if (spendFromActualScript) {
      mapStakeHolders.inversionista = spendFromActualScript.testnetAddr;
    }

    console.log('spendFromActualScript', spendFromActualScript);

    console.log(actualScript);

    // Saber si el propietario tiene una wallet

    // Obtener Product Feature de distribución
    const response1 = await fetch(
      `/api/calls/backend/getProduct?projectId=${actualScript.productID}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const projectData = await response1.json();
    console.log('projectData', projectData);
    const hasTokenGenesis = projectData.tokenGenesis;

    if (hasTokenGenesis) {
      toast.error('El token ya habia sido distribuido anteriormente.');
      return;
    }

    const stakeHoldersDistribution = getProjectTokenDistribution(projectData);
    const ownerWallet = checkOwnerWallet(projectData);
    const tokenPrice = await getTokenLovelacePrice(projectData);

    if (!tokenPrice) {
      toast.error('Error calculando el precio del token');
      return;
    }

    if (ownerWallet) {
      mapStakeHolders.propietario = ownerWallet;
    }

    const tokenToDistributeSum = stakeHoldersDistribution.reduce(
      (sum: number, item: any) => sum + parseInt(item.CANTIDAD),
      0
    );
    let addresses: Array<any> = [];

    let marketplaceTokensAmount;

    if (stakeHoldersDistribution) {
      console.log(Object.keys(mapStakeHolders));
      Object.keys(mapStakeHolders).forEach((stakeHolder: string) => {
        let amountOfTokens = parseInt(
          stakeHoldersDistribution.find(
            (stakeHolderDis: any) =>
              stakeHolderDis.CONCEPTO.toLowerCase() === stakeHolder
          )?.CANTIDAD
        );

        if (stakeHolder === 'inversionista') {
          marketplaceTokensAmount = amountOfTokens;
        }

        if (stakeHolder === 'administrador' && !ownerWallet) {
          const ownerAmountOfTokens = parseInt(
            stakeHoldersDistribution.find(
              (stakeHolderDis: any) =>
                stakeHolderDis.CONCEPTO.toLowerCase() === 'propietario'
            )?.CANTIDAD
          );
          amountOfTokens = amountOfTokens + ownerAmountOfTokens;
        }

        if (amountOfTokens) {
          const address: any = {
            address: mapStakeHolders[stakeHolder],
            lovelace: 0,
            multiAsset: [
              {
                policyid: actualScript.id,
                tokens: {
                  [actualScript.token_name]: amountOfTokens,
                },
              },
            ],
          };
          if (stakeHolder === 'inversionista') {
            address.datum = {
              beneficiary: coreWallet.id,
            };
          }
          addresses.push(address);
        }
      });

      console.log(addresses);
    }

    const payload = {
      mint_redeemer: 'Mint',
      payload: {
        wallet_id: walletID,
        addresses: addresses,
        mint: {
          asset: {
            policyid: actualScript.id,
            tokens: {
              [actualScript.token_name]: tokenToDistributeSum,
            },
          },
        },
      },
    };

    console.log('payload', payload);
    const response = await fetch('/api/transactions/mint-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const buildTxResponse = await response.json();

    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: [],
      });

      const postDistributionPayload = {
        updateProduct: {
          id: actualScript.productID,
          tokenClaimedByOwner: ownerWallet ? true : false,
          tokenGenesis: true,
        },
        createToken: {
          tokenName: actualScript.token_name,
          supply: marketplaceTokensAmount,
          productID: actualScript.productID,
          policyID: actualScript.id,
          oraclePrice: 0,
        },
        createOracleDatum: {
          action: 'Update',
          master_wallet_id:
            '575a7f01272dd95a9ba2696e9e3d4895fe39b12350f7fa88a301b3ad',
          oracle_wallet_name: 'SuanOracle',
          payload: {
            data: [
              {
                policy_id: actualScript.id,
                token: actualScript.token_name,
                price: tokenPrice,
              },
            ],
            validity: 86400000,
          },
        },
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        postDistributionPayload,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
    }
  };

  return (
    <>
      <Card>
        <Card.Header
          title="Scripts"
          tooltip={
            <button
              type="button"
              className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
              onClick={handleOpenCreateScriptModal}
            >
              <PlusIcon />
            </button>
          }
        />

        <Card.Body>
          <ScriptsList
            scripts={scripts}
            itemsPerPage={5}
            handleOpenMintModal={handleOpenMintModal}
            handleDistributeTokens={handleDistributeTokens}
            handleDeleteScript={handleDeleteScript}
          />
        </Card.Body>
      </Card>
      <CreateScriptModal
        createScriptModal={createScriptModal}
        handleOpenCreateScriptModal={handleOpenCreateScriptModal}
        getCoreWalletData={getCoreWalletData}
      />
      <MintModal
        mintModal={mintModal}
        scripts={scripts}
        selectedScript={selectedScript}
        handleOpenMintModal={handleOpenMintModal}
      />
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="distributeTokens"
      />
    </>
  );
}
