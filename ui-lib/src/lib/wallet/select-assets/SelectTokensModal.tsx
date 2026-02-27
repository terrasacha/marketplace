import { useContext, useEffect, useState, useCallback } from 'react';
import AssetCard from '../../wallet/select-assets/AssetCard';
import Modal from '../../common/Modal';
import { textToHex, WalletContext, hexToText } from '@marketplaces/utils-2';
import { getWalletUtxos } from '../../common/walletApi';

interface SelectTokensModalProps {
  selectTokensModal: { visible: boolean; data: any; recipientID: number };
  handleOpenSelectTokensModal: (recipientID?: number) => void;
  handleSetSelectedTokensToSelectTokensModal: (data: any) => void;
  handleAddRecipientSelectedAssets: (index: number, data: any) => void;
  newTransactionGroup: any;
  handleAddCheckedAsset: (data: any) => void;
  handleRemoveCheckedAsset: (
    fingerprintToRemove: string,
    recipientIDToRemove: number
  ) => void;
  checkedAssetList: Array<any>;
}

export default function SelectTokensModal(props: SelectTokensModalProps) {
  const {
    selectTokensModal,
    handleOpenSelectTokensModal,
    handleSetSelectedTokensToSelectTokensModal,
    handleAddRecipientSelectedAssets,
    newTransactionGroup,
    checkedAssetList,
    handleAddCheckedAsset,
    handleRemoveCheckedAsset,
  } = props;

  const { walletData, walletID } = useContext<any>(WalletContext);

  const [assetsFilter, setAssetsFilter] = useState<{
    search: string;
    type: string;
  }>({
    search: '',
    type: 'ALL',
  });

  const [assetsList, setAssetsList] = useState<Array<any>>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);

  // Función para generar fingerprints
  const generateFingerprint = (asset: any) => {
    return `${asset.policy_id}${textToHex(asset.asset_name)}`;
  };

  /**
   * Extrae assets directamente de UTXOs (misma lógica que WalletAssets)
   */
  const extractAssetsFromUtxos = useCallback((utxos: any[]): any[] => {
    const assetsMap = new Map<string, { quantity: number; fingerprint: string }>();

    if (!utxos || !Array.isArray(utxos)) {
      return [];
    }

    utxos.forEach((utxo: any) => {
      // Estructura: utxo.tokens donde las claves son fingerprints completos (policy_id + asset_name en hex)
      if (utxo.tokens && typeof utxo.tokens === 'object') {
        Object.keys(utxo.tokens).forEach((fingerprint) => {
          if (fingerprint && typeof fingerprint === 'string' && fingerprint.length >= 56) {
            const quantity = parseInt(utxo.tokens[fingerprint] || '0');

            if (quantity > 0) {
              const existing = assetsMap.get(fingerprint);
              if (existing) {
                existing.quantity += quantity;
              } else {
                assetsMap.set(fingerprint, { quantity, fingerprint });
              }
            }
          }
        });
      }

      // Estructura alternativa: utxo.amount es array con { unit, quantity }
      if (Array.isArray(utxo.amount)) {
        utxo.amount.forEach((item: any) => {
          if (item.unit && item.unit !== 'lovelace' && typeof item.unit === 'string' && item.unit.length >= 56) {
            const quantity = parseInt(item.quantity || '0');
            if (quantity > 0) {
              const existing = assetsMap.get(item.unit);
              if (existing) {
                existing.quantity += quantity;
              } else {
                assetsMap.set(item.unit, { quantity, fingerprint: item.unit });
              }
            }
          }
        });
      }
    });

    // Convertir Map a array y extraer información
    return Array.from(assetsMap.entries()).map(([fingerprint, data]) => {
      // Extraer policy_id (primeros 56 caracteres)
      const policyId = fingerprint.substring(0, 56);

      // Extraer asset_name en hex (resto del string después de los 56 caracteres)
      const assetNameHex = fingerprint.substring(56);

      // Convertir hex a UTF-8 para obtener el nombre legible
      let assetName = '';
      try {
        assetName = hexToText(assetNameHex);
      } catch (error) {
        // Si falla la conversión, usar el hex como fallback
        console.warn(`No se pudo convertir hex a texto: ${assetNameHex}`, error);
        assetName = assetNameHex;
      }

      return {
        fingerprint, // Fingerprint completo (para identificar el asset único)
        policy_id: policyId, // Policy ID (56 caracteres)
        asset_name: assetName, // Nombre del asset en UTF-8
        asset_name_hex: assetNameHex, // Nombre en hex (para búsqueda en API)
        quantity: data.quantity.toString(), // Cantidad que tiene el usuario
        user_quantity: data.quantity.toString(), // Alias para compatibilidad
      };
    });
  }, []);

  // Función para obtener assets desde UTXOs
  const fetchAssetsFromUtxos = useCallback(async () => {
    if (!walletID) {
      return;
    }

    setIsLoadingAssets(true);

    try {
      // 1. Obtener UTXOs de la wallet
      const utxosResult = await getWalletUtxos(walletID);

      if (!utxosResult.success || !utxosResult.data) {
        console.error('Error al obtener UTXOs:', utxosResult.error);
        setAssetsList([]);
        setIsLoadingAssets(false);
        return;
      }

      // 2. Extraer UTXOs de la respuesta
      let utxos: any[] = [];
      if (Array.isArray(utxosResult.data)) {
        utxos = utxosResult.data;
      } else if (utxosResult.data?.utxos && Array.isArray(utxosResult.data.utxos)) {
        utxos = utxosResult.data.utxos;
      } else if (utxosResult.data?.data && Array.isArray(utxosResult.data.data)) {
        utxos = utxosResult.data.data;
      }

      if (utxos.length === 0) {
        setAssetsList([]);
        setIsLoadingAssets(false);
        return;
      }

      // 3. Extraer assets directamente de UTXOs
      const assets = extractAssetsFromUtxos(utxos);

      // 4. Mapear assets al formato esperado por el modal
      const mappedAssets = assets.map((asset: any) => ({
        fingerprint: asset.fingerprint,
        policy_id: asset.policy_id,
        asset_name: asset.asset_name,
        asset_name_hex: asset.asset_name_hex,
        quantity: asset.user_quantity,
        user_quantity: asset.user_quantity,
      }));

      setAssetsList(mappedAssets);
    } catch (error) {
      console.error('Error al obtener assets desde UTXOs:', error);
      setAssetsList([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [walletID, extractAssetsFromUtxos]);

  useEffect(() => {
    // Cargar assets cuando se abre el modal
    if (selectTokensModal.visible && walletID) {
      fetchAssetsFromUtxos();
    } else if (!selectTokensModal.visible) {
      // Limpiar lista al cerrar el modal
      setAssetsList([]);
    }
  }, [selectTokensModal.visible, walletID, fetchAssetsFromUtxos]);

  useEffect(() => {
    // Actualizar assets con información de checkedAssetList cuando hay assets seleccionados
    if (checkedAssetList.length > 0 && assetsList.length > 0) {
      setAssetsList((prevState) => {
        return prevState.map((asset) => {
          // Calcular cantidad usada por otros destinatarios
          const usedSupply = checkedAssetList.reduce((acc, current) => {
            if (current.fingerprint === asset.fingerprint) {
              const selectedSupply = parseInt(current.selectedSupply, 10);
              if (!isNaN(selectedSupply)) {
                acc += selectedSupply;
              }
            }
            return acc;
          }, 0);

          // Calcular cantidad disponible (usar quantity original del asset)
          const originalQuantity = parseInt(asset.quantity || asset.user_quantity || '0', 10);
          const availableSupply = String(
            Math.max(0, originalQuantity - usedSupply)
          );

          // Verificar si este asset está seleccionado para este destinatario
          const checkedAsset = checkedAssetList
            .filter(
              (checkedAsset: any) =>
                checkedAsset.recipientID === selectTokensModal.recipientID
            )
            .find(
              (checkedAsset: any) =>
                checkedAsset.fingerprint === asset.fingerprint
            );

          if (checkedAsset) {
            return {
              ...asset,
              quantity: availableSupply,
              selectedSupply: checkedAsset.selectedSupply || '',
              checked: true,
            };
          }

          return {
            ...asset,
            quantity: availableSupply,
            selectedSupply: '',
            checked: false,
          };
        });
      });
    } else if (assetsList.length > 0 && checkedAssetList.length === 0) {
      // Si no hay assets seleccionados, resetear el estado checked
      setAssetsList((prevState) => {
        return prevState.map((asset) => ({
          ...asset,
          selectedSupply: '',
          checked: false,
        }));
      });
    }
  }, [checkedAssetList, selectTokensModal.recipientID, assetsList]);

  const handleFilterInputChange = (field: string, value: string) => {
    setAssetsFilter((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAccept = () => {
    const selectedAssets = checkedAssetList.filter(
      (asset) => asset.recipientID === selectTokensModal.recipientID
    );

    handleAddRecipientSelectedAssets(
      selectTokensModal.recipientID,
      selectedAssets
    );
    handleOpenSelectTokensModal();
    setAssetsList([]); // Limpiar la lista de activos al cerrar
  };

  const handleAssetQuantityValue = (fingerprint: string, value: string) => {
    setAssetsList((prevState) => {
      return prevState.map((asset) => {
        if (asset.fingerprint === fingerprint) {
          return { ...asset, quantity: value };
        } else {
          return asset;
        }
      });
    });
  };

  return (
    <Modal show={selectTokensModal.visible} size="7xl">
      <Modal.Header
        onClose={() => {
          handleOpenSelectTokensModal();
          handleSetSelectedTokensToSelectTokensModal([]);
          setAssetsList([]); // Limpiar la lista de activos al cerrar
        }}
      >
        Selecciona Assets
      </Modal.Header>
      <Modal.Body>
        <div>
          {isLoadingAssets ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando activos...</p>
              </div>
            </div>
          ) : assetsList.length > 0 ? (
            <>
              <p>Tús Activos</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {assetsList.map((asset: any, index: number) => (
                  <AssetCard
                    key={index}
                    recipientID={selectTokensModal.recipientID}
                    assetName={asset.asset_name}
                    policy_id={asset.policy_id}
                    fingerprint={asset.fingerprint}
                    availableSupplyValue={asset.quantity}
                    selectedSupplyValue={asset.selectedSupply}
                    isChecked={asset.checked}
                    handleAddCheckedAsset={handleAddCheckedAsset}
                    handleRemoveCheckedAsset={handleRemoveCheckedAsset}
                    handleAssetQuantityValue={handleAssetQuantityValue}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              No tienes activos disponibles para enviar
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-end">
        <button
          type="button"
          className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-xs px-3 py-3 w-56"
          onClick={handleAccept}
        >
          Aceptar
        </button>
      </Modal.Footer>
    </Modal>
  );
}
