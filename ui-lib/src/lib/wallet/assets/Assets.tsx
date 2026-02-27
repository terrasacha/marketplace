import { useEffect, useState } from 'react';
import Card from '../../common/Card';
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
    <Card>
      <Card.Header title="Activos"  className={`${colors.fuente}`}  />
   
      <Card.Body>
        {(() => {
          // Verificar si hay assets disponibles (ya procesados o en proceso)
          const hasAssets = assetsData && assetsData.length > 0;
          const hasMappedAssets = tableMappedAssetsData && tableMappedAssetsData.length > 0;
          
          // Si está procesando y hay assets, mostrar loading
          if (isProcessingAssets && hasAssets) {
            return (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Procesando activos...</p>
                </div>
              </div>
            );
          }
          
          // Si hay assets mapeados o assets originales, mostrarlos
          if (hasMappedAssets || hasAssets) {
            return (
              <>
                {chartActive && hasMappedAssets && (
                  <div>
                    <PieChartCustom data={data} />
                  </div>
                )}
                {tableActive && (
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
                )}
              </>
            );
          }
          
          // Si no hay assets, mostrar mensaje
          return (
            <div className={`${colors.fuenteAlterna}  flex items-center justify-center h-96`}>
              Aún no tienes activos para mostrar {':('}
            </div>
          );
        })()}
      </Card.Body>
    </Card>
  );
}
