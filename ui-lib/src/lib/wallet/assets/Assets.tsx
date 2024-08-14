import { useEffect, useState } from 'react';
import Card from '../../common/Card';
import PieChartCustom from '../../common/charts/PieChartCustom';
import AssetsList from '../../wallet/assets/AssetsList';
import EmptyState from '../../common/EmptyState';


interface AssetsProps {
  assetsData: Array<any>;
  chartActive: boolean;
  tableActive: boolean;
  tableItemsPerPage: number;
}

interface Token {
  policyID: string;
  tokenName: string;
  oraclePrice: number;
  product: {
    showOn: string;
  };
}

interface Asset {
  policy_id: string;
  asset_name: string;
  quantity: string;
  price?: string;
  total?: string;
  product?: {
    showOn: string;
  };
}

export default function Assets(props: AssetsProps) {
  const { assetsData, chartActive, tableActive, tableItemsPerPage } = props;
  const [tableMappedAssetsData, setTableMappedAssetsData] = useState<Asset[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const marketplaceName = 'Terrasacha'; // Nombre del marketplace principal

  useEffect(() => {
    const getRates = async () => {
      const response = await fetch('/api/calls/getRates');
      const data = await response.json();
      console.log('Exchange rates data:', data);

      let dataFormatted: { [key: string]: string } = {};
      data.forEach((item: any) => {
        let obj = `ADArate${item.currency}`;
        dataFormatted[obj] = item.value.toFixed(4);
      });

      console.log('Formatted exchange rates:', dataFormatted);
      setExchangeRate(parseFloat(dataFormatted[`ADArateUSD`]));
    };

    getRates();
  }, []);

  useEffect(() => {
    const getSuanTokens = async () => {
      const request = await fetch(`/api/calls/backend/listTokens`);
      const suanTokens: Token[] = await request.json();
      console.log('Suan tokens:', suanTokens);

      const mappedAssetsData = assetsData?.map((asset: Asset) => {
        console.log('Processing asset:', asset);

        const policyId = asset.policy_id;
        const assetName = asset.asset_name;

        const match = suanTokens.find(
          (item) => policyId === item.policyID && assetName === item.tokenName
        );

        if (!match) {
          return null;
        }

        const assetPriceUSD = (parseInt(match.oraclePrice.toString()) / 1000000) * exchangeRate;
        const assetQuantity = parseInt(asset.quantity);

        return {
          ...asset,
          quantity: assetQuantity.toLocaleString('es-CO'),
          price: assetPriceUSD.toLocaleString('es-CO'),
          total: (assetPriceUSD * assetQuantity).toLocaleString('es-CO'),
          product: match.product,
        };
      }).filter((asset) => asset !== null) as Asset[];

      console.log('Mapped assets data:', mappedAssetsData);
      setTableMappedAssetsData(mappedAssetsData);
    };

    if (exchangeRate) {
      getSuanTokens();
    }
  }, [exchangeRate, assetsData]);

  const myWalletAssets = tableMappedAssetsData?.filter(asset => asset.product?.showOn === marketplaceName);
  const externalWalletAssets = tableMappedAssetsData?.filter(asset => asset.product?.showOn !== marketplaceName);

  console.log('My Wallet Assets:', myWalletAssets);
  console.log('External Wallet Assets:', externalWalletAssets);

  const myWalletData = myWalletAssets?.map((asset) => {
    return {
      name: asset.asset_name!,
      value: parseInt(asset.quantity.replace(/,/g, '')),
    };
  });

  const externalWalletData = externalWalletAssets?.map((asset) => {
    return {
      name: asset.asset_name!,
      value: parseInt(asset.quantity.replace(/,/g, '')),
    };
  });

  console.log('My Wallet Data for Pie Chart:', myWalletData);
  console.log('External Wallet Data for Pie Chart:', externalWalletData);


  if ((myWalletAssets.length === 0 && externalWalletAssets.length === 0) || !assetsData || assetsData.length === 0) {
    return <EmptyState message="No hay activos para mostrar en este momento." />;
  }

  

  return (
    <Card>
      <Card.Body>
        {assetsData?.length ? (
          <>
            <h3 className="text-2xl font-semibold text-center mb-4 text-[#0983a9]">Tokens Principales</h3>
            {chartActive && (
              <div>
                <PieChartCustom data={myWalletData} />
              </div>
            )}
            {tableActive && (
              <AssetsList
                assetsData={myWalletAssets}
                itemsPerPage={tableItemsPerPage}
              />
            )}

            <h3 className="text-2xl font-semibold text-center mb-4 mt-6 text-[#0983a9]">Tokens Externos</h3>
            {chartActive && (
              <div>
                <PieChartCustom data={externalWalletData} />
              </div>
            )}
            {tableActive && (
              <AssetsList
                assetsData={externalWalletAssets}
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
