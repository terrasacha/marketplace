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

  const data = assetsData.map((asset: any) => {
    return {
      name: asset.asset_name,
      value: parseInt(asset.quantity),
    };
  });

  const hola = getIpfsUrlHash("test")
  console.log(hola)

  return (
    <Card>
      <Card.Header title="Activos" />
      <Card.Body>
        {
          assetsData.length ? (
            <>
            {chartActive && (
              <div>
                <PieChartCustom data={data} />
              </div>
            )}
            {tableActive && <AssetsList assetsData={assetsData} itemsPerPage={tableItemsPerPage} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              Aún no tienes activos para mostrar {":("}
            </div>
          )
        }
      </Card.Body>
    </Card>
  );
}
