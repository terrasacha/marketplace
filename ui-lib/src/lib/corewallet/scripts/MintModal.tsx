import { useContext, useEffect, useState } from 'react';
import { LoadingIcon } from '../../icons/LoadingIcon';
import Modal from '../../common/Modal';
import { WalletContext } from '@marketplaces/utils-2';
import { toast } from 'sonner';

interface MintModalProps {
  handleOpenMintModal: () => void;
  mintModal: boolean;
  selectedScript: string | null;
  scripts: Array<any>;
}
interface MintTokensProps {
  walletAddress: string;
  tokenAmount: string;
  sameAddress: boolean;
}

export default function MintModal(props: MintModalProps) {
  const { walletID, walletData } = useContext<any>(WalletContext);
  const { handleOpenMintModal, mintModal, selectedScript, scripts } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log('walletData', walletData);

  const [mintTokens, setMintTokens] = useState<MintTokensProps>({
    walletAddress: '',
    tokenAmount: '',
    sameAddress: true,
  });

  const actualScript = scripts.find(
    (script: any) => script.id === selectedScript
  );
  console.log(actualScript);
  const handleSetMintTokens = (key: string, value: string | boolean) => {
    let parsedValue = value;

    setMintTokens((prevState: any) => {
      return {
        ...prevState,
        [key]: parsedValue,
      };
    });
  };

  const validateFields = () => {
    if (
      (!mintTokens.sameAddress && mintTokens.walletAddress.trim() === '') ||
      mintTokens.tokenAmount.trim() === ''
    ) {
      toast.warning('Complete los campos oblgiatorios poder continuar ...');
      return false;
    }
    return true;
  };

  const handleMintTokens = async () => {
    if (!validateFields()) {
      return;
    }
    setIsLoading(true);
    const policyId = actualScript.id;

    const payload = {
      mint_redeemer: 'Mint',
      payload: {
        wallet_id: walletID,
        addresses: !mintTokens.sameAddress
          ? [
              {
                address: mintTokens.walletAddress,
                lovelace: 0,
                multiAsset: [
                  {
                    policyid: policyId,
                    tokens: {
                      [actualScript.token_name]: parseInt(
                        mintTokens.tokenAmount
                      ),
                    },
                  },
                ],
              },
            ]
          : [],
        metadata: [],
        mint: {
          asset: {
            policyid: policyId,
            tokens: {
              [actualScript.token_name]: parseInt(mintTokens.tokenAmount),
            },
          },
        },
      },
    };
    console.log(payload);
    const response = await fetch('/api/transactions/mint-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    if (responseData?.success) {
      handleOpenMintModal();
    } else {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
    }
    setIsLoading(false);
  };

  const handleBurnTokens = async () => {
    if (!mintTokens.tokenAmount) {
      toast.warning('Complete los campos oblgiatorios poder continuar ...');
      return;
    }

    const walletTokenAmount = walletData.assets.find(
      (asset: any) =>
        asset.id === actualScript.id &&
        asset.asset_name === actualScript.token_name
    ).quantity;

    if (mintTokens.tokenAmount > walletTokenAmount) {
      toast.error(
        'El numero de tokens que deseas quemar es superior al que tienes en la billetera ...'
      );
      return;
    }

    setIsLoading(true);
    const policyId = actualScript.id;

    const payload = {
      mint_redeemer: 'Burn',
      payload: {
        wallet_id: walletID,
        addresses: [],
        metadata: [],
        mint: {
          asset: {
            policyid: policyId,
            tokens: {
              [actualScript.token_name]: -Math.abs(
                parseInt(mintTokens.tokenAmount)
              ),
            },
          },
        },
      },
    };
    console.log(payload);
    const response = await fetch('/api/transactions/mint-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    if (responseData?.success) {
      toast.success('Se han quemado los tokens exitosamente ...');
      handleOpenMintModal();
    } else {
      toast.error('Ha ocurrido un error, intenta nuevamente ...');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Modal show={mintModal} size="6xl">
        <Modal.Header
          onClose={() => {
            handleOpenMintModal();
          }}
        >
          Quema de tokens
        </Modal.Header>
        <Modal.Body>
          {/* <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={mintTokens.sameAddress}
                onChange={(e) =>
                  handleSetMintTokens('sameAddress', !mintTokens.sameAddress)
                }
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm">Enviar a mi mismo</span>
            </label>
          </div>
          {!mintTokens.sameAddress && (
            <div>
              <label className="block mb-2">
                Dirección de billetera
                {!mintTokens.sameAddress && (
                  <span className="text-red-600">*</span>
                )}
              </label>
              <input
                type="text"
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                autoComplete="off"
                placeholder="Dirección de billetera"
                required
                value={mintTokens.walletAddress}
                onInput={(e) =>
                  handleSetMintTokens('walletAddress', e.currentTarget.value)
                }
              />
            </div>
          )} */}
          <div>
            <label className="block mb-2">
              Cantidad de tokens<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              autoComplete="off"
              placeholder="Cantidad de tokens"
              required
              value={mintTokens.tokenAmount}
              onInput={(e) =>
                handleSetMintTokens('tokenAmount', e.currentTarget.value)
              }
            />
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="col-span-4 sm:col-span-1 text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
              onClick={handleBurnTokens}
            >
              {isLoading ? (
                <LoadingIcon className="w-4 h-4" />
              ) : (
                'Quemar tokens'
              )}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
