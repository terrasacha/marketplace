import { useState } from 'react';

interface AssetRowProps {
  index: number;
  asset_name: string;
  quantity: number;
  price: string;
  total: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function AssetRow(props: AssetRowProps) {
  const { index, asset_name, quantity, price, total } = props;

  return (
    <div className="flex space-x-2 items-center bg-custom-dark text-white rounded-lg px-3 py-2 cursor-pointer">
      <div className="flex justify-start items-center w-full space-x-2">
        <div className="flex px-2 hidden md:inline-flex">{index + 1}</div>
        <div className="relative inline-flex items-center justify-center w-7 h-7 overflow-hidden bg-white rounded-full">
          <span className="font-medium text-custom-dark dark:text-gray-300">
            {asset_name.charAt(0)}
          </span>
        </div>
        <p>{asset_name}</p>
      </div>
      <div className="w-[200px] text-center">
        <p>{quantity}</p>
      </div>
      <div className="w-[200px] text-center">
        <p>~ {price || '0'} USD</p>
      </div>
      <div className="w-[200px] text-center">
        <p>~ {total || '0'} USD</p>
      </div>
    </div>
  );
}
