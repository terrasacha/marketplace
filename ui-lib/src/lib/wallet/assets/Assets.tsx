import { useEffect, useState } from 'react';
import PieChartCustom from '../../common/charts/PieChartCustom';
import AssetsList from '../../wallet/assets/AssetsList';
import { getIpfsUrlHash } from '@suan/utils/generic/ipfs';
interface AssetsProps {
  assetsData: Array<any>;
  chartActive: boolean;
  tableActive: boolean;
  tableItemsPerPage: number;
}

interface ChartDataItem {
  name: string;
  value: number;
}

export default function Assets(props: AssetsProps) {
  const { assetsData, chartActive, tableActive, tableItemsPerPage } = props;
  const [tableMappedAssetsData, setTableMappedAssetsData] = useState<any>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isProcessingAssets, setIsProcessingAssets] = useState<boolean>(false);

  useEffect(() => {
    const getRates = async () => {
      const response = await fetch('/api/calls/getRates');
      const data = await response.json();
      let dataFormatted: any = {};
      data.map((item: any) => {
        let obj = `ADArate${item.currency}`;
        dataFormatted[obj] = item.value;
      });

      setExchangeRate(parseFloat(dataFormatted[`ADArateUSD`]));
    };
    if (exchangeRate === 0) {
      getRates();
    }
  }, []);

  useEffect(() => {
    const getSuanTokens = async () => {
      setIsProcessingAssets(true);
      try {
        const request = await fetch(`/api/calls/backend/listTokens`);
        
        // Verificar si la respuesta es exitosa
        if (!request.ok) {
          // Si falla el endpoint, mostrar todos los assets sin precio
          const mappedAssetsData = assetsData?.map((asset: any) => {
            const assetQuantity = parseInt(asset.user_quantity || asset.quantity || '0');
            return {
              ...asset,
              quantity: assetQuantity.toLocaleString('es-CO'),
              price: '0.00',
              total: '0.00',
            };
          }) || [];
          setTableMappedAssetsData(mappedAssetsData);
          setIsProcessingAssets(false);
          return;
        }

        const suanTokens = await request.json();
        
        // Verificar que suanTokens sea un array
        if (!Array.isArray(suanTokens)) {
          // Si no es array, mostrar todos los assets sin precio
          const mappedAssetsData = assetsData?.map((asset: any) => {
            const assetQuantity = parseInt(asset.user_quantity || asset.quantity || '0');
            return {
              ...asset,
              quantity: assetQuantity.toLocaleString('es-CO'),
              price: '0.00',
              total: '0.00',
            };
          }) || [];
          setTableMappedAssetsData(mappedAssetsData);
          setIsProcessingAssets(false);
          return;
        }

        // NO FILTRAR - Mapear TODOS los assets y agregar precio solo a los que tienen match
        const mappedAssetsData = assetsData?.map((asset: any) => {
          // Buscar match en suanTokens
          const match = suanTokens.find(
            (item2: any) =>
              asset.policy_id === item2.policyID &&
              asset.asset_name === item2.tokenName
          );

          // Calcular precio solo si hay match
          const assetPriceUSD = match
            ? (parseInt(match.oraclePrice) / 1000000) * exchangeRate
            : 0;

          const assetQuantity = parseInt(asset.user_quantity || asset.quantity || '0');

          return {
            ...asset,
            quantity: assetQuantity.toLocaleString('es-CO'),
            price: assetPriceUSD.toLocaleString('es-CO', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            total: (assetPriceUSD * assetQuantity).toLocaleString('es-CO', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          };
        }) || [];
        
        setTableMappedAssetsData(mappedAssetsData);
        setIsProcessingAssets(false);
      } catch (error) {
        console.error('Error al obtener tokens SUAN:', error);
        // Si hay un error, mostrar todos los assets sin precio
        const mappedAssetsData = assetsData?.map((asset: any) => {
          const assetQuantity = parseInt(asset.user_quantity || asset.quantity || '0');
          return {
            ...asset,
            quantity: assetQuantity.toLocaleString('es-CO'),
            price: '0.00',
            total: '0.00',
          };
        }) || [];
        setTableMappedAssetsData(mappedAssetsData);
        setIsProcessingAssets(false);
      }
    };

    /* const getTokensPrice = async () => {
      const request = await fetch(`/api/calls/backend/listTokens`);
      const suanTokens = await request.json();

      const mappedAssetsData = assetsData?.map((asset: any) => {
        const actualAssetPrice = suanTokens.find(
          (token: any) =>
            token.tokenName === asset.asset_name &&
            token.policyID === asset.policy_id
        );

        const assetPriceUSD = actualAssetPrice
          ? (parseInt(actualAssetPrice.oraclePrice) / 1000000) * exchangeRate
          : 0;
        const assetQuantity = parseInt(asset.quantity);

        return {
          ...asset,
          quantity: assetQuantity.toLocaleString('es-CO'),
          price: assetPriceUSD.toLocaleString('es-CO'),
          total: (assetPriceUSD * assetQuantity).toLocaleString('es-CO'),
        };
      });
      setTableMappedAssetsData(mappedAssetsData);
    }; */

    // Procesar con precios cuando exchangeRate esté disponible
    if (exchangeRate && assetsData && assetsData.length > 0) {
      getSuanTokens();
    } else if (assetsData && assetsData.length > 0 && !exchangeRate) {
      // Si hay assets pero aún no hay exchangeRate, mapearlos sin precio inicialmente
      const initialMappedAssets = assetsData.map((asset: any) => {
        const assetQuantity = parseInt(asset.user_quantity || asset.quantity || '0');
        return {
          ...asset,
          quantity: assetQuantity.toLocaleString('es-CO'),
          price: '0.00',
          total: '0.00',
        };
      });
      setTableMappedAssetsData(initialMappedAssets);
    }
  }, [exchangeRate, assetsData]);

  const data = tableMappedAssetsData?.map((asset: any) => {
    return {
      name: asset.asset_name,
      value: parseInt(asset.quantity),
    };
  });
  const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente:'font-jostBold',
      fuenteAlterna:'font-jostRegular',
    },
  
    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor:  'bg-custom-dark' ,
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente:'font-semibold',
    fuenteAlterna:'font-medium',
  };
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 animate-scale-in">
      {/* Header modernizado */}
      <div className="pt-6 px-6 pb-4 border-b border-gray-100/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className={`mb-0 text-2xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent`}>
                Activos
              </h3>
              <p className="mb-0 text-sm text-gray-500 font-jostRegular">Gestiona y visualiza tus tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body modernizado */}
      <div className="p-6">
        {(() => {
          // Verificar si hay assets disponibles (ya procesados o en proceso)
          const hasAssets = assetsData && assetsData.length > 0;
          const hasMappedAssets = tableMappedAssetsData && tableMappedAssetsData.length > 0;
          
          // Si está procesando y hay assets, mostrar loading
          if (isProcessingAssets && hasAssets) {
            return (
              <div className="flex items-center justify-center h-96 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-custom-marca-boton border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-jostRegular">Procesando activos...</p>
                </div>
              </div>
            );
          }
          
          // Si hay assets mapeados o assets originales, mostrarlos
          if (hasMappedAssets || hasAssets) {
            return (
              <div className="space-y-6">
                {chartActive && hasMappedAssets && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100/50 hover:shadow-lg transition-all duration-300 animate-fade-in">
                    <div className="mb-4">
                      <p className="text-sm font-jostBold text-gray-700 flex items-center gap-2">
                        <span className="w-1 h-4 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></span>
                        Distribución de Activos
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center">
                      <PieChartCustom data={data} />
                    </div>
                  </div>
                )}
                {tableActive && (
                  <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <AssetsList
                      assetsData={hasMappedAssets ? tableMappedAssetsData : (assetsData?.map((asset: any) => {
                        const assetQuantity = parseInt(asset.user_quantity || asset.quantity || '0');
                        return {
                          ...asset,
                          quantity: assetQuantity.toLocaleString('es-CO'),
                          price: '0.00',
                          total: '0.00',
                        };
                      }) || [])}
                      itemsPerPage={tableItemsPerPage}
                    />
                  </div>
                )}
              </div>
            );
          }
          
          // Si no hay assets, mostrar mensaje
          return (
            <div className="flex items-center justify-center h-96 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-custom-marca-boton-alterno2/20 to-custom-marca-boton-alterno/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-jostRegular text-lg mb-2">Aún no tienes activos para mostrar</p>
                <p className="text-gray-400 font-jostRegular text-sm">Tus tokens aparecerán aquí cuando los recibas</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
