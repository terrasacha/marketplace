import { useRouter } from 'next/router';
import { getIpfsUrlHash } from '@suan/utils/generic/ipfs';
import { splitLongValues, txHashLink } from '@suan/utils/generic/conversions';
import Card from '../../common/Card';
import { PlusIcon } from '../../icons/PlusIcon';
import SignTransactionModal from '../../wallet/sign-transaction/SignTransactionModal';
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
  };

  const handleDeleteScript = async (
    policyId: string | null = null
  ): Promise<boolean> => {
    // Si el contrato que se envia es un contrato padre, eliminar todos sus hijos
    const actualScript = scripts.find((script: any) => script.id === policyId);

    const payload = {
      policyID: policyId,
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

      if (subScript.id !== policyId) {
        await handleDeleteScript(subScript.id);
      }
    }

    if (actualScript.scriptParentID === actualScript.id) {
      await getCoreWalletData();
    }

    return deleteData.data;
  };
  const handleUpdateScript = async (
    policyId: string | null = null,
    newStatus: boolean
  ): Promise<boolean> => {
    // Si el contrato que se envia es un contrato padre, eliminar todos sus hijos
    const actualScript = scripts.find((script: any) => script.id === policyId);

    const payload = {
      policyID: policyId,
      newStatus,
    };

    const response = await fetch(`/api/calls/backend/updateScriptStatusById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const updateData = await response.json();

    for (let index = 0; index < actualScript.scripts.items.length; index++) {
      const subScript = actualScript.scripts.items[index];
      if (subScript.id !== policyId) {
        await handleUpdateScript(subScript.id, newStatus);
      }
    }

    if (actualScript.scriptParentID === actualScript.id) {
      await getCoreWalletData();
    }

    return updateData.data;
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

  const getProjectLocation = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const projectLocation =
        productFeatures.find((item: any) => {
          return item.featureID === 'C_ubicacion';
        })?.value || '';

      return projectLocation;
    } else {
      return false;
    }
  };

  const getProjectArea = (projectData: any) => {
    const productFeatures = projectData.productFeatures.items;
    if (productFeatures) {
      const projectArea =
        productFeatures.find((item: any) => {
          return item.featureID === 'D_area';
        })?.value || '';

      return projectArea;
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

  /* function fixAddressArray(
    data: any,
    targetAddress: string,
    tokenName: string
  ) {
    let newEntry = null;
    for (let entry of data) {
      if (entry.address === targetAddress) {
        for (let asset of entry.multiAsset) {
          if (asset.tokens && asset.tokens[tokenName]) {
            // Obtener el valor del token
            let originalValue = asset.tokens[tokenName];
            // Calcular la mitad
            let halfValue = Math.floor(originalValue / 2);
            // Asignar la primera mitad al valor original
            asset.tokens[tokenName] = halfValue;
            // Crear un nuevo elemento con la otra mitad
            let newAsset = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: originalValue - halfValue,
              },
            };
            // Clonar el objeto de entrada original y modificar la cantidad del token
            newEntry = JSON.parse(JSON.stringify(entry));
            newEntry.multiAsset[0].tokens[tokenName] =
              newAsset.tokens[tokenName];
            break;
          }
        }
        break;
      }
    }
    if (newEntry) {
      data.push(newEntry);
    }
    return data;
  } */

  function fixAddressArray(
    data: any,
    targetAddress: string,
    tokenName: string
  ) {
    let newEntries = [];

    for (let entry of data) {
      if (entry.address === targetAddress) {
        for (let asset of entry.multiAsset) {
          if (asset.tokens && asset.tokens[tokenName]) {
            // Obtener el valor del token
            let originalValue = asset.tokens[tokenName];
            // Calcular un cuarto del valor
            let quarterValue = Math.floor(originalValue / 4);
            // Asignar el primer cuarto al valor original
            asset.tokens[tokenName] = quarterValue;
            // Crear tres nuevos elementos con los otros tres cuartos
            let newAsset1 = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: quarterValue,
              },
            };
            let newAsset2 = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: quarterValue,
              },
            };
            let newAsset3 = {
              policyid: asset.policyid,
              tokens: {
                [tokenName]: originalValue - 3 * quarterValue,
              },
            };
            // Clonar el objeto de entrada original tres veces y modificar la cantidad del token
            let newEntry1 = JSON.parse(JSON.stringify(entry));
            newEntry1.multiAsset[0].tokens[tokenName] =
              newAsset1.tokens[tokenName];

            let newEntry2 = JSON.parse(JSON.stringify(entry));
            newEntry2.multiAsset[0].tokens[tokenName] =
              newAsset2.tokens[tokenName];

            let newEntry3 = JSON.parse(JSON.stringify(entry));
            newEntry3.multiAsset[0].tokens[tokenName] =
              newAsset3.tokens[tokenName];

            // Añadir las nuevas entradas al array de nuevos elementos
            newEntries.push(newEntry1, newEntry2, newEntry3);
            break;
          }
        }
        break;
      }
    }
    // Añadir las nuevas entradas al array original de datos
    data.push(...newEntries);
    return data;
  }

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
        script.script_type === 'spendProject'
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

      console.log('addresses', addresses);
      const newAddressArray = fixAddressArray(
        addresses,
        mapStakeHolders.inversionista,
        actualScript.token_name
      );
      console.log('newAddressArray', newAddressArray);
      // filtrar por stake address = mapStakeHolders.inversionista obtener indice y modificar la cantidad de tokens
      // dividir en 2, luego la mitad que queda hacer un push de los addresses con un item similar al indice del inversionista
      // pero con la mitad restante
    }

    // Get category image from IPFS

    const IPFSUrlHash = getIpfsUrlHash('REDD+');
    const tokenImageUrl = `ipfs://${IPFSUrlHash}`;

    // Get Area & location (Hace falta trabajar sobre el seteo de estos datos en Plataforma)
    // Area debe calcularse nuevamente al agregar o quitar predio
    // Ubicación debe calcularse con base al centroide generado por los predios al agregar o quitar predio
    const projectArea = getProjectArea(projectData);
    const projectLocation = getProjectLocation(projectData);

    const metadata = {
      'Nombre del token': actualScript.token_name,
      'Identificador del proyecto': projectData.id,
      'Nombre del proyecto': projectData.name,
      Area: projectArea, // Tarea: almacenar dato de area
      Categoria: projectData.categoryID,
      'Fecha de creación': projectData.createdAt,
      Descripción: projectData.description,
      //Ubicación: '0 0 0 0', // Tarea: almacenar coordenadas de centroide
      files: [
        {
          src: tokenImageUrl,
          mediaType: 'image/png',
        },
      ],
      image: tokenImageUrl,
      mediaType: 'image/png',
    };

    console.log('metadata', metadata);
    const truncated_metadata = splitLongValues(metadata);
    console.log('truncated_metadata', truncated_metadata);

    const payload = {
      mint_redeemer: 'Mint',
      payload: {
        wallet_id: walletID,
        addresses: addresses,
        utxo: {
          transaction_id:
            '21b65f853f2d5c0e823c23bef9c7cb1ac4c0418ddf65037dd6fe576f1c32f179',
          index: 0,
        },
        mint: {
          asset: {
            policyid: actualScript.id,
            tokens: {
              [actualScript.token_name]: tokenToDistributeSum,
            },
          },
        },
        metadata: {
          '721': truncated_metadata,
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
        metadata: truncated_metadata,
      });

      const postDistributionPayload = {
        scriptId: actualScript.id,
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
        scriptId: actualScript.id,
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
            handleUpdateScript={handleUpdateScript}
          />
        </Card.Body>
      </Card>
      <CreateScriptModal
        scripts={scripts}
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
