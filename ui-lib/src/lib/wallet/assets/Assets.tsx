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

  useEffect(() => {
    const getRates = async () => {
      const response = await fetch('/api/calls/getRates');
      const data = await response.json();
      let dataFormatted: any = {};
      data.map((item: any) => {
        let obj = `ADArate${item.currency}`;
        dataFormatted[obj] = item.value.toFixed(4);
      });

      setExchangeRate(parseFloat(dataFormatted[`ADArateUSD`]));
    };
    if (exchangeRate === 0) {
      getRates();
    }
  }, []);

  useEffect(() => {
    const getSuanTokens = async () => {
      const request = await fetch(`/api/calls/backend/listTokens`);
      const suanTokens = await request.json();

      const mappedAssetsData = assetsData
        ?.filter((asset: any) => {
          return suanTokens.some(
            (item2: any) =>
              asset.policy_id === item2.policyID &&
              asset.asset_name === item2.tokenName
          );
        })
        .map((asset: any) => {
          const match = suanTokens.find(
            (item2: any) =>
              asset.policy_id === item2.policyID &&
              asset.asset_name === item2.tokenName
          );

          const assetPriceUSD = match
            ? (parseInt(match.oraclePrice) / 1000000) * exchangeRate
            : 0;
          const assetQuantity = parseInt(asset.quantity);

          return {
            ...asset,
            quantity: assetQuantity.toLocaleString('es-CO'),
            price: assetPriceUSD.toLocaleString('es-CO'),
            total: (assetPriceUSD * assetQuantity).toLocaleString('es-CO'),
          };
        });
      console.log('assets mapeados', mappedAssetsData);
      setTableMappedAssetsData(mappedAssetsData);
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

    if (exchangeRate && assetsData) {
      getSuanTokens();
    }
  }, [exchangeRate, assetsData]);

  const data = tableMappedAssetsData?.map((asset: any) => {
    return {
      name: asset.asset_name,
      value: parseInt(asset.quantity),
    };
  });

  return (
    <Card>
      <Card.Header title="Activos" />
      <Card.Body>
        {assetsData?.length ? (
          <>
            {chartActive && (
              <div>
                <PieChartCustom data={data} />
              </div>
            )}
            {tableActive && (
              <AssetsList
                assetsData={tableMappedAssetsData}
                itemsPerPage={tableItemsPerPage}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            Aún no tienes activos para mostrar {':('}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
