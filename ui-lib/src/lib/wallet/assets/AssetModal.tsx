import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'flowbite-react';
import { XIcon } from '../../icons/XIcon';
import CopyToClipboard from '../../common/CopyToClipboard';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import { getDateFromTimeStamp, hexToText, textToHex } from '@marketplaces/utils-2';

// Función para obtener access token (copiada de walletApi.ts)
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = window.localStorage.getItem('wallet_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.access_token || null;
    }
  } catch (err) {
    // Silenciar errores de acceso al token en localStorage
  }
  return null;
};

interface AssetModalProps {
  assetData: any;
  handleOpenAssetModal: (visible?: boolean, asset?: any) => void;
  openModal: boolean;
}

export default function AssetModal(props: AssetModalProps) {
  const { assetData, handleOpenAssetModal, openModal } = props;
  const [assetMetadata, setAssetMetadata] = useState<any>(null);
  const [assetInfo, setAssetInfo] = useState<any>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [imageGatewayIndex, setImageGatewayIndex] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'blockchain' | 'metadata'>('blockchain');

  const extractInnerObject: any = (obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      if (keys.length === 1 && typeof obj[keys[0]] === 'object') {
        return extractInnerObject(obj[keys[0]]);
      }
      // Return the object if it contains more properties at the current level
      if (keys.length > 1) {
        return obj;
      }
    }
    return obj;
  };

  useEffect(() => {
    const loadAssetDetails = async () => {
      if (!assetData?.policy_id || !openModal) {
        return;
      }

      setIsLoadingDetails(true);

      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          setIsLoadingDetails(false);
          return;
        }

        // Llamar al endpoint de detalles del policy
        // Nota: El API tiene un límite máximo de 20 items por página
        const response = await fetch(
          `/api/assets/policy/${assetData.policy_id}/details?page=1&limit=20`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          setIsLoadingDetails(false);
          return;
        }

        const data = await response.json();

        // Verificar directamente si hay assets disponibles
        if (data && data.assets && Array.isArray(data.assets) && data.assets.length > 0) {
          
          // Buscar el asset específico con múltiples estrategias
          let assetDetail: any = null;

          // Estrategia 1: Buscar por fingerprint completo en hex (asset.asset)
          // Este es el método más confiable ya que asset.asset es el fingerprint completo
          if (assetData.fingerprint) {
            assetDetail = data.assets.find((asset: any) => {
              return asset.asset === assetData.fingerprint;
            });
          }

          // Estrategia 2: Construir fingerprint desde policy_id + asset_name_hex
          // Esto es útil si el fingerprint no coincide exactamente
          if (!assetDetail && assetData.policy_id && assetData.asset_name_hex) {
            const constructedFingerprint = `${assetData.policy_id}${assetData.asset_name_hex}`;
            assetDetail = data.assets.find((asset: any) => {
              return asset.asset === constructedFingerprint;
            });
          }

          // Estrategia 3: Buscar por fingerprint bech32 (si está disponible)
          if (!assetDetail && assetData.fingerprint) {
            assetDetail = data.assets.find((asset: any) => {
              return asset.fingerprint === assetData.fingerprint;
            });
          }

          // Estrategia 4: Buscar por nombre (UTF-8 o hex) dentro del mismo policy
          if (!assetDetail && assetData.policy_id && assetData.asset_name) {
            assetDetail = data.assets.find((asset: any) => {
              // Debe estar en el mismo policy
              if (asset.policy_id !== assetData.policy_id) return false;
              
              // Comparar por nombre en diferentes formatos
              return asset.asset_name_decoded === assetData.asset_name ||
                     asset.asset_name === assetData.asset_name_hex ||
                     (asset.onchain_metadata?.name && asset.onchain_metadata.name === assetData.asset_name) ||
                     (asset.metadata?.name && asset.metadata.name === assetData.asset_name) ||
                     (asset.metadata?.raw?.name && asset.metadata.raw.name === assetData.asset_name);
            });
          }
          
          // Estrategia 5: Si solo hay un asset en el policy, usarlo (útil cuando hay un solo asset)
          if (!assetDetail && data.assets.length === 1) {
            assetDetail = data.assets[0];
          }

          if (assetDetail) {
            setAssetInfo(assetDetail);
            
            // Extraer metadata - combinar onchain_metadata y metadata.raw
            let metadata: any = {};
            
            // Priorizar onchain_metadata (más completo y confiable)
            if (assetDetail.onchain_metadata && typeof assetDetail.onchain_metadata === 'object' && assetDetail.onchain_metadata !== null) {
              // Usar directamente onchain_metadata (ya es un objeto plano)
              metadata = { ...assetDetail.onchain_metadata };
            }
            
            // Agregar campos de metadata.raw que no estén ya en metadata
            if (assetDetail.metadata?.raw && typeof assetDetail.metadata.raw === 'object' && assetDetail.metadata.raw !== null) {
              Object.keys(assetDetail.metadata.raw).forEach(key => {
                if (!metadata[key]) {
                  metadata[key] = assetDetail.metadata.raw[key];
                }
              });
            }
            
            // Agregar otros campos de metadata (name, description, ticker, etc.) que no estén ya incluidos
            if (assetDetail.metadata && typeof assetDetail.metadata === 'object') {
              Object.keys(assetDetail.metadata).forEach(key => {
                // Omitir 'raw' ya que lo procesamos arriba
                if (key !== 'raw' && !metadata[key]) {
                  const value = assetDetail.metadata[key];
                  if (value !== null && value !== undefined) {
                    metadata[key] = value;
                  }
                }
              });
            }
            
            setAssetMetadata(Object.keys(metadata).length > 0 ? metadata : null);
          } else {
            setAssetInfo({});
            setAssetMetadata(null);
          }
        } else {
          setAssetInfo({});
          setAssetMetadata(null);
        }
      } catch (error) {
        // Silenciar errores de red en el modal
      } finally {
        setIsLoadingDetails(false);
      }
    };

    if (openModal && assetData) {
      loadAssetDetails();
    }
  }, [openModal, assetData]);

  // Resetear estados de imagen cuando cambia el asset
  useEffect(() => {
    setImageGatewayIndex(0);
    setImageError(false);
  }, [assetData?.fingerprint]);

  return (
    <Modal
      show={openModal}
      onClose={() => handleOpenAssetModal()}
      size="7xl"
      position={'center'}
    >
      <Modal.Body className="bg-custom-dark rounded-lg">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-custom-fondo text-custom-dark hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-custom-dark font-medium rounded text-sm p-2.5 "
            onClick={() => handleOpenAssetModal()}
          >
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col lg:flex-row text-white rounded-lg px-4 py-4 sm:p-6 gap-6 lg:gap-10 justify-evenly max-h-[80vh] overflow-y-auto">
          {/* Primera columna (imagen y título) */}
          <div className="flex flex-col items-center w-full lg:w-1/3 p-3 pt-4 lg:pt-8">
            {(() => {
              // Buscar imagen en múltiples lugares con prioridad clara
              // Prioridad: assetInfo.onchain_metadata.image > assetInfo.metadata.raw.image > assetMetadata.image > assetInfo.metadata.logo
              let imageUrl: string | null = null;
              
              if (assetInfo.onchain_metadata && typeof assetInfo.onchain_metadata === 'object' && assetInfo.onchain_metadata.image) {
                imageUrl = assetInfo.onchain_metadata.image;
              } else if (assetInfo.metadata?.raw && typeof assetInfo.metadata.raw === 'object' && assetInfo.metadata.raw.image) {
                imageUrl = assetInfo.metadata.raw.image;
              } else if (assetMetadata && typeof assetMetadata === 'object' && assetMetadata.image) {
                imageUrl = assetMetadata.image;
              } else if (assetInfo.metadata?.logo) {
                imageUrl = assetInfo.metadata.logo;
              }
              
              // Convertir IPFS a gateway URL con múltiples fallbacks
              let ipfsHash: string | null = null;
              let finalImageUrl: string | null = null;
              
              if (imageUrl && typeof imageUrl === 'string') {
                if (imageUrl.startsWith('ipfs://')) {
                  ipfsHash = imageUrl.replace('ipfs://', '').trim();
                } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                  finalImageUrl = imageUrl;
                } else if (imageUrl.startsWith('Qm') || imageUrl.startsWith('baf')) {
                  ipfsHash = imageUrl;
                } else {
                  finalImageUrl = imageUrl;
                }
                
                // Si tenemos un hash IPFS, generar URLs con múltiples gateways
                if (ipfsHash) {
                  const gateways = [
                    `https://coffee-dry-barnacle-850.mypinata.cloud/ipfs/${ipfsHash}`, // Gateway personalizado de Pinata
                    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`, // Gateway público de Pinata
                    `https://ipfs.io/ipfs/${ipfsHash}`, // Gateway público de IPFS
                    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, // Gateway de Cloudflare
                    `https://dweb.link/ipfs/${ipfsHash}`, // Gateway de Protocol Labs
                  ];
                  
                  // Usar el gateway actual según el índice
                  finalImageUrl = gateways[imageGatewayIndex] || gateways[0];
                }
              } else {
              }
              
              // Handler para errores de carga de imagen con fallback automático
              const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const img = e.currentTarget;
                
                if (ipfsHash) {
                  const gateways = [
                    `https://coffee-dry-barnacle-850.mypinata.cloud/ipfs/${ipfsHash}`,
                    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                    `https://ipfs.io/ipfs/${ipfsHash}`,
                    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
                    `https://dweb.link/ipfs/${ipfsHash}`,
                  ];
                  
                  if (imageGatewayIndex < gateways.length - 1) {
                    const nextIndex = imageGatewayIndex + 1;
                    setImageGatewayIndex(nextIndex);
                    img.src = gateways[nextIndex];
                  } else {
                    setImageError(true);
                    img.style.display = 'none';
                  }
                } else {
                  setImageError(true);
                  img.style.display = 'none';
                }
              };
              
              return finalImageUrl && !imageError ? (
              <img
                src={finalImageUrl}
                alt="Asset Image"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto rounded-lg shadow-lg object-contain"
                onError={handleImageError}
              />
            ) : (
              <div
                role="status"
                className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
              >
                <div className="flex items-center justify-center w-80 h-80 bg-gray-300 rounded-full dark:bg-gray-700">
                  <svg
                    className="w-10 h-10 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                  </svg>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            );
            })()}
            <h1 className="text-white text-center my-4 text-xl sm:text-2xl break-words">
              {assetInfo.onchain_metadata?.name || 
               assetInfo.metadata?.name || 
               assetInfo.metadata?.raw?.name ||
               assetInfo.asset_name_decoded || 
               assetData.asset_name || 
               'Asset'}
            </h1>
            {(assetInfo.onchain_metadata?.description || 
              assetInfo.metadata?.description || 
              assetInfo.metadata?.raw?.description ||
              assetMetadata?.description) ? (
              <p className="text-white text-center text-xs sm:text-sm mt-2 opacity-80 line-clamp-3">
                {assetInfo.onchain_metadata?.description || 
                 assetInfo.metadata?.description || 
                 assetInfo.metadata?.raw?.description ||
                 assetMetadata?.description}
              </p>
            ) : null}
          </div>
          {/* Segunda columna (detalles y metadata) */}
          <div className="w-full lg:w-2/3 p-3 space-y-4">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <p className="mt-4 text-white">Cargando detalles del asset...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Resumen superior siempre visible */}
                <table className="w-full text-xs sm:text-sm">
                  <tbody className="activos fila_activos">
                    <tr className="bg-gray-600">
                      <td>En billetera: </td>
                      <td>{assetData.user_quantity || assetData.quantity || '0'}</td>
                      <td>En circulación: </td>
                      <td>
                        {assetInfo.quantity
                          ? assetInfo.quantity
                          : 'No disponible'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tabs para cambiar de sección */}
                <div className="mt-3 border-b border-gray-600 flex text-xs sm:text-sm">
                  <button
                    type="button"
                    className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
                      activeSection === 'blockchain'
                        ? 'border-white text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveSection('blockchain')}
                  >
                    Blockchain Data
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
                      activeSection === 'metadata'
                        ? 'border-white text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveSection('metadata')}
                  >
                    Metadata
                  </button>
                </div>

                {/* Contenido según la sección activa */}
                {activeSection === 'blockchain' ? (
                  <>
                    <h3 className="font-extrabold mt-3">Blockchain Data</h3>
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <tbody className="fila_activos">
                          <tr>
                            <td>Policy ID:</td>
                            <td className="flex">
                              <div className="truncate w-[60%]">
                                {assetData.policy_id || 'N/A'}
                              </div>
                              <CopyToClipboard
                                iconClassName="h-5 w-5 ml-2"
                                copyValue={assetData.policy_id || ''}
                                tooltipLabel="Copiar !"
                              />
                            </td>
                          </tr>
                          <tr className="bg-gray-600">
                            <td>Fingerprint:</td>
                            <td className="flex">
                              <div className="truncate w-[60%]">
                                {assetInfo.fingerprint || assetData.fingerprint || 'No disponible'}
                              </div>
                              <CopyToClipboard
                                iconClassName="h-5 w-5 ml-2"
                                copyValue={assetInfo.fingerprint || assetData.fingerprint || ''}
                                tooltipLabel="Copiar !"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Nombre del activo:</td>
                            <td>
                              {assetData.asset_name || assetInfo.asset_name_decoded || 'N/A'}
                            </td>
                          </tr>
                          {assetInfo.mint_or_burn_count !== undefined && (
                            <tr className="bg-gray-600">
                              <td>Mints/Burns:</td>
                              <td>{assetInfo.mint_or_burn_count}</td>
                            </tr>
                          )}
                          {assetInfo.initial_mint_tx_hash && (
                            <tr>
                              <td>Hash inicial:</td>
                              <td className="truncate">{assetInfo.initial_mint_tx_hash}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Información adicional: Metadata */}
                    <h3 className="font-extrabold mt-3">Metadata</h3>
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        {(() => {
                          // Usar assetInfo directamente si assetMetadata está vacío
                          // Prioridad: assetMetadata > assetInfo.onchain_metadata > assetInfo.metadata.raw
                          let metadataToShow = null;
                          
                          if (assetMetadata && typeof assetMetadata === 'object' && Object.keys(assetMetadata).length > 0) {
                            metadataToShow = assetMetadata;
                          } else if (assetInfo.onchain_metadata && typeof assetInfo.onchain_metadata === 'object' && Object.keys(assetInfo.onchain_metadata).length > 0) {
                            metadataToShow = assetInfo.onchain_metadata;
                          } else if (assetInfo.metadata?.raw && typeof assetInfo.metadata.raw === 'object' && Object.keys(assetInfo.metadata.raw).length > 0) {
                            metadataToShow = assetInfo.metadata.raw;
                          }
                          
                          return metadataToShow && Object.keys(metadataToShow).length > 0 ? (
                          <tbody className="fila_activos">
                            {Object.entries(metadataToShow).map(
                              ([key, value]: any, idx: number) => {
                                // Omitir campos que ya se mostraron arriba o que son objetos anidados complejos
                                if (key === 'raw' && typeof value === 'object') {
                                  // Mostrar campos de raw individualmente
                                  return Object.entries(value).map(([rawKey, rawValue]: any, rawIdx: number) => (
                                    <tr
                                      key={`raw-${rawKey}`}
                                      className={`${(idx + rawIdx) % 2 === 0 ? 'bg-gray-600' : ''}`}
                                    >
                                      <td>{rawKey}:</td>
                                      <td>
                                        {typeof rawValue === 'object' 
                                          ? JSON.stringify(rawValue, null, 2)
                                          : String(rawValue)}
                                      </td>
                                    </tr>
                                  ));
                                }
                                
                                if (Array.isArray(value)) {
                                  return (
                                    <React.Fragment key={key}>
                                      <tr>
                                        <td colSpan={2} className="font-semibold">{key}:</td>
                                      </tr>
                                      {value.map((item: any, index: number) => {
                                        if (typeof item === 'object') {
                                          return Object.entries(item).map(
                                            ([key2, value2]: any) => (
                                              <tr key={`${key}-${index}-${key2}`} className={`${(idx + index) % 2 === 0 ? 'bg-gray-600' : ''}`}>
                                                <td className="pl-4">{'→ ' + key2}</td>
                                                <td>{typeof value2 === 'object' ? JSON.stringify(value2) : String(value2)}</td>
                                              </tr>
                                            )
                                          );
                                        } else {
                                          return (
                                            <tr key={`${key}-${index}`} className={`${(idx + index) % 2 === 0 ? 'bg-gray-600' : ''}`}>
                                              <td className="pl-4">{'→ [' + index + ']'}</td>
                                              <td>{String(item)}</td>
                                            </tr>
                                          );
                                        }
                                      })}
                                    </React.Fragment>
                                  );
                                } else if (typeof value === 'object' && value !== null) {
                                  return (
                                    <React.Fragment key={key}>
                                      <tr>
                                        <td colSpan={2} className="font-semibold">{key}:</td>
                                      </tr>
                                      {Object.entries(value).map(([subKey, subValue]: any, subIdx: number) => (
                                        <tr key={`${key}-${subKey}`} className={`${(idx + subIdx) % 2 === 0 ? 'bg-gray-600' : ''}`}>
                                          <td className="pl-4">{'→ ' + subKey}</td>
                                          <td>{typeof subValue === 'object' ? JSON.stringify(subValue) : String(subValue)}</td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  );
                                } else {
                                  return (
                                    <tr
                                      key={key}
                                      className={`${idx % 2 === 0 ? 'bg-gray-600' : ''}`}
                                    >
                                      <td className="font-medium">{key}:</td>
                                      <td>{value !== null && value !== undefined ? String(value) : 'N/A'}</td>
                                    </tr>
                                  );
                                }
                              }
                            )}
                          </tbody>
                        ) : assetInfo.onchain_metadata || assetInfo.metadata ? (
                          <tbody className="fila_activos">
                            <tr>
                              <td colSpan={2} className="text-center text-gray-400">No se encontró metadata procesada</td>
                            </tr>
                          </tbody>
                        ) : (
                          <tbody className="fila_activos">
                            <tr>
                              <td colSpan={2} className="text-center text-gray-400">No hay metadata disponible</td>
                            </tr>
                          </tbody>
                        );
                        })()}
                      </table>
                    </div>
                    {/* Raw JSON */}
                    {assetMetadata && Object.keys(assetMetadata).length > 0 && (
                      <div>
                        <h2 className="font-extrabold	">Raw JSON</h2>
                        <JsonView
                          data={assetMetadata}
                          shouldExpandNode={allExpanded}
                          style={defaultStyles}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
