import { useState } from 'react';
import { Card, CopyIcon, ExternalLinkIcon, EyeIcon } from '../ui-lib';

interface AssetsProps {
  assetsData: any
}

export default function Assets(props: any) {
  const { assetsData } = props
  
  const assetsDummyList = [
    {
      token: 'ADA',
      balance: 858,
      price: 0.49,
    },
    {
      token: 'SOL',
      balance: 200,
      price: 0.89,
    },
  ];
  return (
    <Card>
      <Card.Header title="Activos" />
      <Card.Body>
        {/* Tus activos serán listados acá */}
        <div className="flex space-x-2 items-center px-3 py-2">
          <div className="w-full ms-2"># Activos</div>
          <div className="w-full text-center">Balance Actual</div>
          <div className="w-full text-center">Ultimo precio</div>
          <div className="w-full text-end">Total</div>
        </div>
        <div className="space-y-2">
          {assetsData && assetsData.map((asset: any, index: number) => {
            return (
              <div key={index} className="flex space-x-2 items-center bg-white rounded-lg px-3 py-2">
                <div className="flex justify-start items-center w-full space-x-2">
                  <div className="px-2">{index + 1}</div>
                  <div className="relative inline-flex items-center justify-center w-7 h-7 overflow-hidden bg-red-200 rounded-full dark:bg-gray-600">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {asset.asset_name.charAt(0)}
                    </span>
                  </div>
                  <p>{asset.asset_name}</p>
                </div>
                <div className="w-full text-center">
                  <p>{asset.quantity}</p>
                </div>
                <div className="w-full text-center">
                  <p>$ {asset.price || "0.5"}</p>
                </div>
                <div className="w-full text-end">
                  <p>$ {(asset.balance * asset.price).toFixed(4) || 0}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}
