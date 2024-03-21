import { useRouter } from 'next/router';
import { Card, PlusIcon } from '../../ui-lib';
import ScriptsList from './ScriptsList';
import { useContext, useEffect, useState } from 'react';
import CreateScriptModal from './CreateScriptModal';
import MintModal from './MintModal';
import { toast } from 'sonner';
import { WalletContext, getActualPeriod } from '@marketplaces/utils-2';
import Swal from 'sweetalert2';
import { coingeckoPrices } from '@marketplaces/data-access';

export default function Scripts(props: any) {
  const { walletID } = useContext<any>(WalletContext);
  const [scripts, setScripts] = useState<Array<any>>([]);
  const [createScriptModal, setCreateScriptModal] = useState<boolean>(false);
  const [mintModal, setMintModal] = useState<boolean>(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const getCoreWalletData = async () => {
    const request = await fetch('/api/contracts/get-scripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await request.json();
    console.log(responseData);

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

  const handleDeleteScript = (policyId: string | null = null) => {
    const payload = {
      policyID: policyId,
    };

    Swal.fire({
      title: 'Estas seguro de eliminar el contrato?',
      text: 'No podrás revertir esta acción !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch(`/api/calls/backend/deleteScriptById`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const deleteData = await response.json();
        if (deleteData.data) {
          toast.success('Contrato eliminado exitosamente ...');
          Swal.fire({
            title: 'Eliminado !',
            text: 'El contrato ha sido eliminado exitosamente.',
            icon: 'success',
          });
        } else {
          toast.error('Ha habido un error intentando eliminar el contrato ...');
        }
        await getCoreWalletData();
      }
    });
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

  const getTokenLovelacePrice = async (projectData: any) => {
    const { actualTokenPrice, tokenCurrency } =
      getProjectTokenData(projectData);
    const currencyToCryptoRate = await coingeckoPrices(
      'cardano',
      tokenCurrency
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

  const handleDistributeTokens = async (policyId: string | null = null) => {
    const actualScript = scripts.find((script: any) => script.id === policyId);

    let mapStakeHolders: any = {
      bioc: 'addr_test1vqx420pm9cx326rh0q8yx6u4h72ae56l9ekzk05m8w9qe3cz5swj5',
      // propietario:
      //   'addr_test1vpgydu6xuc3nvyzpdnkq4jpaprs0rp5x5xzk088grlp92cq057hxl',
      administrador:
        'addr_test1qzttu3gj6vtz6e6j4p4pnmyw52x5j7kw47kce4hux9fv445khez395ck94n492r2r8kgag5df9avatad3nt0cv2jettqxfwfwv',
      buffer: 'addr_test1vqs34z4ljy3c6u3s97m64zqz7f0ks6vtre2dcpl5um8wz2qgaxq8z',
      comunidad:
        'addr_test1vqvx6mm487nkkpavyf7sqflgavutajq8veer5wmy0nwlgyg27rsqk',
      inversionista:
        'addr_test1qq0uh3hap3sqcj3cwlx2w3yq9vm4wclgp4x0y3wuyvapzdcle0r06rrqp39rsa7v5azgq2eh2a37sr2v7fzacge6zymsn0w2mg',
    };

    const administradorId =
      '96be4512d3162d6752a86a19ec8ea28d497aceafad8cd6fc3152cad6';

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

    if (stakeHoldersDistribution) {
      console.log(Object.keys(mapStakeHolders));
      Object.keys(mapStakeHolders).forEach((stakeHolder: string) => {
        let amountOfTokens = parseInt(
          stakeHoldersDistribution.find(
            (stakeHolderDis: any) =>
              stakeHolderDis.CONCEPTO.toLowerCase() === stakeHolder
          )?.CANTIDAD
        );

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
              beneficiary: administradorId,
              price: tokenPrice,
            };
          }
          addresses.push(address);
        }
      });

      console.log(addresses);
    }

    const payload = {
      wallet_id: walletID,
      addresses: addresses,
      mint: {
        asset: {
          policyid: actualScript.id,
          tokens: {
            [actualScript.token_name]: tokenToDistributeSum,
          },
        },
        redeemer: 0,
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
    const responseData = await response.json();

    // if (responseData?.success) {
    //   toast.success('Tokens enviados ...');

    //   // Actualizar un campo en tabla dynamo que indique que los tokens del proyecto han sido reclamados por el propietario o no
    //   // Actualizar campo token genesis

    //   const payload = {
    //     id: actualScript.productID,
    //     tokenClaimedByOwner: ownerWallet ? true : false,
    //     tokenGenesis: true,
    //   };

    //   await fetch('/api/calls/backend/updateProduct', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(payload),
    //   });
    // } else {
    //   toast.error('Ha ocurrido un error, intenta nuevamente ...');
    // }
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
    </>
  );
}
