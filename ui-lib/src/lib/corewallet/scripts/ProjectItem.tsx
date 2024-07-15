import { useContext, useEffect, useState } from 'react';
import { CopyToClipboard, SignTransactionModal } from '../../ui-lib';
import { Pie } from 'react-chartjs-2';
import {
  getActualPeriod,
  mapBuildTransactionInfo,
  WalletContext,
} from '@marketplaces/utils-2';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Tooltip } from 'react-tooltip';
import { splitLongValues } from '@suan/utils/generic/conversions';
import { getIpfsUrlHash } from '@suan/utils/generic/ipfs';

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number; // Nuevo campo para el porcentaje
}

interface Traducciones {
  [key: string]: string;
}

interface ProjectItemProps {
  project: any;
  fetchProjects: () => void;
}

interface ProjectContractsProps {
  mintContract: any;
  spendContract: any;
  utxoToSpend: string;
}

export default function ProjectItem(props: ProjectItemProps) {
  const { project, fetchProjects } = props;
  const { walletID, walletAddress } = useContext<any>(WalletContext);
  const [newChartData, setChartData] = useState<ChartDataItem[]>([]);
  const [globalTokenAmount, setGlobalTokenAmount] = useState<number>(0);
  const [mintProjectToken, setMintProjectToken] = useState<any>(null);
  const [spendSwap, setSpendSwap] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenName, setTokenName] = useState<string>('');
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);

  useEffect(() => {
    if (project) {
      console.log(project);
      const spendFromProject = project.scripts.items.find(
        (script: any) => script.script_type === 'spendProject'
      );

      const mintProjectTokenFromProject = project.scripts.items.find(
        (script: any) => script.script_type === 'mintProjectToken'
      );

      setSpendSwap(spendFromProject);
      setMintProjectToken(mintProjectTokenFromProject);
      setTokenData(project.tokens.items[0]);
    }
  }, [project]);

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const getTokenAmountDistribution = (productFeatures: any) => {
    const tokenAmountDistribution = JSON.parse(
      productFeatures.items.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION';
      })[0]?.value || '{}'
    );

    return tokenAmountDistribution;
  };

  const traducciones: Traducciones = {
    buffer: 'Buffer',
    comunity: 'Comunidad',
    investor: 'Inversionista',
    owner: 'Propietario',
    suan: 'Suan',
  };

  useEffect(() => {
    const globalTokenTotalAmount = getGlobalTokenTotalAmount(project);
    const newData = getNewChartData(project);
    setGlobalTokenAmount(globalTokenTotalAmount);

    if (newData) {
      const chartData = transformDataForChart(newData, globalTokenTotalAmount);
      setChartData(chartData);
    }
  }, []);

  function getGlobalTokenTotalAmount(project: any): number {
    const GLOBAL_TOKEN_TOTAL_AMOUNT = 'GLOBAL_TOKEN_TOTAL_AMOUNT';
    const featureItem = project.productFeatures.items.find(
      (item: any) => item.featureID === GLOBAL_TOKEN_TOTAL_AMOUNT
    );
    return featureItem ? Number(featureItem.value) : 0;
  }

  function getNewChartData(project: any): any {
    return JSON.parse(
      project.productFeatures.items.filter(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
      )[0]?.value || '[]'
    );
  }

  function transformDataForChart(
    data: any,
    totalAmount: number
  ): ChartDataItem[] {
    const dataFormatted = data.map((item: any) => {
      const percentage = (item.CANTIDAD / totalAmount) * 100;
      return {
        name: item.CONCEPTO,
        value: item.CANTIDAD,
        percentage: percentage,
      };
    });
    return dataFormatted;
  }

  const data = {
    labels: newChartData.map((item: ChartDataItem) => item.name),
    datasets: [
      {
        label: 'Tokens repartidos',
        data: newChartData.map((item: ChartDataItem) => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.9)',
          'rgba(75, 192, 192, 0.9)',
          'rgba(53, 162, 235, 0.9)',
          'rgba(255, 205, 86, 0.9)',
          'rgba(255, 159, 64, 0.9)',
          'rgba(153, 102, 255, 0.9)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(53, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 10,
          },
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            if (context.datasetIndex === 0 && context.dataIndex !== undefined) {
              const dataset = data.datasets[context.datasetIndex];
              const value = dataset.data[context.dataIndex];
              const total = globalTokenAmount;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            }
            return label;
          },
        },
      },
    },
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

  const getCoreWallet = async () => {
    const response = await fetch('/api/calls/getCoreWallet');
    const data = await response.json();
    console.log('coreWallet', data);
    return data;
  };

  const toPascalCase = (str: string) => {
    return str
      .split(' ') // Divide el string en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Convierte la primera letra a mayúscula y el resto a minúscula
      .join(''); // Une las palabras sin espacios
  };

  const handleCreateProjectContracts = async () => {
    if (project.scripts.items.length > 0) {
      toast.error('El token ya tiene contratos asociados.');
      return;
    }

    const mintProjectTokenPayload = {
      script_type: 'mintProjectToken',
      name: `${toPascalCase(project.name)}MintContract`,
      wallet_id: walletID,
      tokenName: tokenName,
      save_flag: true,
      project_id: `${project.id}`,
      oracle_wallet_name: 'SuanOracle',
    };
    console.log(mintProjectTokenPayload);

    const response = await fetch('/api/contracts/create-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mintProjectTokenPayload),
    });
    const createdMintProjectTokenContract = await response.json();

    if (!createdMintProjectTokenContract?.success) {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Something went wrong!, ${createdMintProjectTokenContract.msg}`,
      });
      return;
    }
    toast.success('Se ha creado el contrato mint exitosamente ...');

    const spendProjectPayload = {
      script_type: 'spendProject',
      name: `${toPascalCase(project.name)}SpendContract`,
      wallet_id: walletID,
      save_flag: true,
      project_id: project.id,
      tokenName: tokenName,
      parent_policy_id: createdMintProjectTokenContract.data.id,
      oracle_wallet_name: 'SuanOracle',
    };

    const response2 = await fetch('/api/contracts/create-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spendProjectPayload),
    });
    const createdSpendContract = await response2.json();

    if (!createdSpendContract?.success) {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Something went wrong!, ${createdSpendContract.msg}`,
      });
      return;
    }
    toast.success('Se ha creado el contrato Spend exitosamente ...');

    return {
      mintContract: {
        id: createdMintProjectTokenContract.data.id,
        testnetAddr: createdMintProjectTokenContract.data.testnet_address, // Debe manejarse el caso cuando el ambiente es prod o dev
      },
      spendContract: {
        id: createdSpendContract.data.id,
        testnetAddr: createdSpendContract.data.testnet_address,
      },
      utxoToSpend: createdMintProjectTokenContract.data.utxo_to_spend,
    };
  };

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

  const validateTokenName = () => {
    if (tokenName.trim() === '') {
      toast.warning('Complete los campos oblgiatorios poder continuar ...');
      return false;
    }

    if (tokenName.trim().length > 50) {
      toast.warning('El nombre del token no puede tener más de 50 caracteres.');
      return false;
    }

    return true;
  };

  const tokenMintAndDistribution = async (
    projectContracts: ProjectContractsProps
  ) => {
    const { mintContract, spendContract } = projectContracts;

    // Obtener corewallet
    const coreWallet = await getCoreWallet();

    let mapStakeHolders: any = {
      bioc: 'addr_test1vqx420pm9cx326rh0q8yx6u4h72ae56l9ekzk05m8w9qe3cz5swj5',
      administrador: coreWallet.address, // Addres de billetera unica tipo corewallet
      inversionista: spendContract.testnetAddr,
      buffer: 'addr_test1vqs34z4ljy3c6u3s97m64zqz7f0ks6vtre2dcpl5um8wz2qgaxq8z',
      comunidad:
        'addr_test1vqvx6mm487nkkpavyf7sqflgavutajq8veer5wmy0nwlgyg27rsqk',
      // propietario: ...
    };

    if (project.tokenGenesis) {
      toast.error('El token ya habia sido distribuido anteriormente.');
      return false;
    }

    const stakeHoldersDistribution = getProjectTokenDistribution(project);
    const ownerWallet = checkOwnerWallet(project);
    const tokenPrice = await getTokenLovelacePrice(project);

    if (!tokenPrice) {
      toast.error('Error calculando el precio del token');
      return false;
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
                policyid: mintContract.id,
                tokens: {
                  [tokenName]: amountOfTokens,
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
        tokenName
      );
      console.log('newAddressArray', newAddressArray);
    }

    // Get category image from IPFS

    const IPFSUrlHash = getIpfsUrlHash('REDD+');
    const tokenImageUrl = `ipfs://${IPFSUrlHash}`;

    // Get Area & location (Hace falta trabajar sobre el seteo de estos datos en Plataforma)
    // Area debe calcularse nuevamente al agregar o quitar predio
    // Ubicación debe calcularse con base al centroide generado por los predios al agregar o quitar predio
    const projectArea = getProjectArea(project);
    const projectLocation = getProjectLocation(project);

    const metadata = {
      'Nombre del token': tokenName,
      'Identificador del proyecto': project.id,
      'Nombre del proyecto': project.name,
      Area: projectArea, // Tarea: almacenar dato de area
      Categoria: project.categoryID,
      'Fecha de creación': project.createdAt,
      Descripción: project.description,
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
        utxo: projectContracts.utxoToSpend,
        addresses: addresses,
        mint: {
          asset: {
            policyid: mintContract.id,
            tokens: {
              [tokenName]: tokenToDistributeSum,
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
        scriptId: mintContract.id,
        updateProduct: {
          id: project.id,
          tokenClaimedByOwner: ownerWallet ? true : false,
          tokenGenesis: true,
        },
        createToken: {
          tokenName: tokenName,
          supply: marketplaceTokensAmount,
          productID: project.id,
          policyID: mintContract.id,
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
                policy_id: mintContract.id,
                token: tokenName,
                price: tokenPrice,
              },
            ],
            validity: 86400000,
          },
        },
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        scriptId: mintContract.id,
        postDistributionPayload,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
    }
  };

  const handleDistributeTokens = async () => {
    const isValidTokenName = validateTokenName();

    if (!isValidTokenName) {
      return;
    }

    setIsLoading(true);
    const projectContracts = await handleCreateProjectContracts();

    if (!projectContracts) {
      setIsLoading(false);
      return;
    }

    await tokenMintAndDistribution(projectContracts);

    setIsLoading(false);
  };

  return (
    <>
      <div
        className="col-span-2 xl:col-span-1 w-full rounded-lg bg-custom-dark p-3"
        key={project.id}
      >
        <div className="flex flex-col justify-center xl:flex-row xl:justify-none p-3 gap-3 items-center">
          <div className="flex-none">
            <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-white rounded-lg">
              <span className="font-medium text-custom-dark">PY</span>
            </div>
          </div>
          <div className="flex-1 text-white text-center xl:text-left">
            <p className="text-xl text-amber-400">{project.name}</p>
            <div className="flex gap-2">
              <p className="flex-1 text-sm truncate w-max-36">
                {project.category.name}
              </p>
            </div>
          </div>
          <div className="flex-none">
            {project.tokenGenesis ? (
              <button
                type="button"
                className="text-custom-dark bg-white hover:gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
                onClick={() => {
                  getTokenAmountDistribution(project.productFeatures);
                }}
              >
                Enviar tokens a propietario
              </button>
            ) : (
              <>
                <button
                  id="clickable"
                  type="button"
                  className="text-custom-dark bg-white hover:gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
                >
                  Distribuir Tokens
                </button>

                <Tooltip anchorSelect="#clickable" clickable>
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Nombre del token"
                      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-1`}
                      onInput={(e) => setTokenName(e.currentTarget.value)}
                      value={tokenName}
                    />
                    <button
                      className="col-span-4 sm:col-span-1 bg-amber-400 hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm text-black px-5 py-2.5 w-full "
                      onClick={handleDistributeTokens}
                    >
                      Distribuir
                    </button>
                  </div>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-col sm:flex-row p-3 border-b border-t gap-3">
          {project.tokenGenesis && (
            <div className="flex-1 text-white space-y-2">
              <p className="mb-2 text-amber-400">Token</p>
              <div className="flex mb-0 pb-0">
                <p className="flex-1 text-xs truncate w-max-36 py-1">
                  POLICY ID: <span>{tokenData?.id}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={tokenData?.id}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <p className="flex-1 text-xs py-1">
                NOMBRE: <span>{tokenData?.tokenName}</span>
              </p>
              <p className="flex-1 text-xs py-1">
                CANTIDAD: <span>{tokenData?.supply}</span>
              </p>
              <p className="flex-1 text-xs py-1">
                PRECIO:{' '}
                <span>
                  ₳ {(tokenData?.oraclePrice / 1000000).toLocaleString('es-CO')}
                </span>
              </p>
            </div>
          )}
          <div className="flex-1 text-white">
            <p className="mb-2 text-amber-400">Distribución StakeHolders</p>
            <div className={`flex items-center w-full justify-center`}>
              <div
                className={`${
                  project.tokenGenesis ? 'h-64 w-64' : 'h-80 w-80'
                }`}
              >
                <Pie data={data} options={options} />
              </div>
            </div>
          </div>
        </div>
        {project.tokenGenesis && (
          <div className="flex items-center p-3 border-b gap-3">
            <div className="flex-1 text-white">
              <p className="mb-2 text-amber-400">Contrato de distribución</p>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-max-36">
                  POLICY ID:{' '}
                  <span className="flex">{mintProjectToken?.id}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={mintProjectToken?.id}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-max-36">
                  PBK: <span className="flex">{mintProjectToken?.pbk}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={mintProjectToken?.pbk}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-max-36">
                  ADDRESS:{' '}
                  <span className="flex">{mintProjectToken?.testnetAddr}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={mintProjectToken?.testnetAddr}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 text-white">
              <p className="mb-2 text-amber-400">Contrato de intercambio</p>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-max-36">
                  POLICY ID: <span className="flex">{spendSwap?.id}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={spendSwap?.id}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-max-36">
                  PBK: <span className="flex">{spendSwap?.pbk}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={spendSwap?.pbk}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <p className="flex-1 text-xs truncate w-max-36">
                  ADDRESS:{' '}
                  <span className="flex">{spendSwap?.testnetAddr}</span>
                </p>
                <div className="flex-none">
                  <CopyToClipboard
                    iconClassName="h-4 w-4"
                    copyValue={spendSwap?.testnetAddr}
                    tooltipLabel="Copiar !"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="distributeTokens"
      />
    </>
  );
}
