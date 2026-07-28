import React, { useContext, useState, useEffect, useCallback } from 'react';
import Assets from '../wallet/assets/Assets';
import { WalletContext, hexToText, formatAssetDisplayName } from '@marketplaces/utils-2';
import { getWalletUtxos } from '../common/walletApi';


/**
 * Extrae assets directamente de UTXOs sin necesidad de llamar al API
 * El token concatena el policy_id (56 caracteres) y el nombre del asset en hex
 * Retorna array de assets simplificados con: fingerprint, policy_id, asset_name, cantidad
 */
const extractAssetsFromUtxos = (utxos: any[]): any[] => {
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
      assetName = formatAssetDisplayName(hexToText(assetNameHex), assetNameHex, {
        maxLength: 64,
      });
    } catch (error) {
      console.warn(`No se pudo convertir hex a texto: ${assetNameHex}`, error);
      assetName = formatAssetDisplayName(undefined, assetNameHex, { maxLength: 64 });
    }

    return {
      fingerprint, // Fingerprint completo (para identificar el asset único)
      policy_id: policyId, // Policy ID (56 caracteres)
      asset_name: assetName, // Nombre legible para UI
      asset_name_hex: assetNameHex, // Nombre en hex (para búsqueda en API)
      user_quantity: data.quantity.toString(), // Cantidad que tiene el usuario
      raw_quantity: data.quantity,
    };
  });
};


interface WalletAssetsProps {
  chartActive?: boolean;
  tableActive?: boolean;
  tableItemsPerPage?: number;
}

export default function WalletAssets(props: WalletAssetsProps = {}) {
  const { walletData, walletID } = useContext<any>(WalletContext);
  const [assetsFromUtxos, setAssetsFromUtxos] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);
  
  // Props con valores por defecto
  const {
    chartActive = false,
    tableActive = true,
    tableItemsPerPage = 24,
  } = props;

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
        setAssetsFromUtxos([]);
        setIsLoadingAssets(false);
        return;
      }

      // 2. Extraer UTXOs de la respuesta
      // La respuesta puede venir como array directo o como objeto con propiedad utxos
      let utxos: any[] = [];
      if (Array.isArray(utxosResult.data)) {
        utxos = utxosResult.data;
      } else if (utxosResult.data?.utxos && Array.isArray(utxosResult.data.utxos)) {
        utxos = utxosResult.data.utxos;
      } else if (utxosResult.data?.data && Array.isArray(utxosResult.data.data)) {
        utxos = utxosResult.data.data;
      }

      if (utxos.length === 0) {
        setAssetsFromUtxos([]);
        setIsLoadingAssets(false);
        return;
      }

      // 3. Extraer assets directamente de UTXOs (sin llamar al API)
      // Esto extrae: fingerprint, policy_id, asset_name (convertido de hex a UTF-8), cantidad
      const assets = extractAssetsFromUtxos(utxos);

      // 4. Mapear assets al formato esperado por el componente Assets
      // Solo información básica: nombre y cantidad (sin metadata, se cargará al hacer clic)
      const mappedAssets = assets.map((asset: any) => ({
        fingerprint: asset.fingerprint, // Fingerprint completo para identificar el asset
        policy_id: asset.policy_id,
        asset_name: asset.asset_name, // Nombre legible
        asset_name_hex: asset.asset_name_hex, // Nombre en hex (para búsqueda en API)
        quantity: asset.user_quantity, // Cantidad del usuario
        user_quantity: asset.user_quantity, // Alias para compatibilidad
        raw_quantity: asset.raw_quantity ?? parseInt(asset.user_quantity || '0', 10),
        // NO incluir metadata, onchain_metadata, etc. (se cargará lazy en el modal)
      }));

      setAssetsFromUtxos(mappedAssets);
    } catch (error) {
      console.error('Error al obtener assets desde UTXOs:', error);
      setAssetsFromUtxos([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [walletID]);

  useEffect(() => {
    fetchAssetsFromUtxos();
  }, [fetchAssetsFromUtxos]);

  // Combinar assets del contexto (si existen) con los obtenidos de UTXOs
  // Priorizar assets de UTXOs ya que son más actualizados
  const allAssets = assetsFromUtxos.length > 0 
    ? assetsFromUtxos 
    : (walletData?.assets || []);

  return (
    <div className="grid grid-cols-1">
      {isLoadingAssets ? (
        <div className="flex items-center justify-center p-8 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-custom-marca-boton border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 font-jostRegular">Cargando activos...</p>
          </div>
        </div>
      ) : (
        <Assets 
          assetsData={allAssets} 
          chartActive={chartActive} 
          tableActive={tableActive} 
          tableItemsPerPage={tableItemsPerPage}
        />
      )}
    </div>
  );
}
