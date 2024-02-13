import { useState } from 'react';

interface AssetCardProps {
  fingerprint: string;
  assetName: string;
  totalSupply: number;
  policyID: string;
  selectedSupply: string;
  checked: boolean;
  handleAssetSelectedChange: (
    fingerprint: string,
    property: string,
    value: string | boolean | number
  ) => void;
}

export default function AssetCard(props: AssetCardProps) {
  const {
    fingerprint,
    assetName,
    totalSupply,
    policyID,
    selectedSupply,
    checked,
    handleAssetSelectedChange,
  } = props;

  const [error, setError] = useState(false);

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    handleAssetSelectedChange(
      fingerprint,
      'selectedSupply',
      value.replace(/[^0-9]/g, '')
    );
    validateSupply(parseInt(value));
  };

  const validateSupply = (supply: number) => {
    if (supply > totalSupply) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleSelectAllSupply = () => {
    handleAssetSelectedChange(
      fingerprint,
      'selectedSupply',
      String(totalSupply)
    );
  };

  const handleCheckAsset = () => {
    if (totalSupply === 1) {
      handleAssetSelectedChange(
        fingerprint,
        'selectedSupply',
        checked ? '' : '1'
      );
    }
    handleAssetSelectedChange(fingerprint, 'checked', !checked);
  };

  const handleAdd = () => {};

  return (
    <div className="border w-full p-3">
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <div className="flex-none">
          <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-red-200 rounded-full dark:bg-gray-600">
            <span className="font-medium text-gray-600 dark:text-gray-300">
              NS
            </span>
          </div>
        </div>
        {/* Nombre token y cantidad */}
        <div className="w-full">
          <p>{assetName}</p>
          <p>{checked ? selectedSupply + ' / ' + totalSupply : totalSupply}</p>
        </div>
      </div>
      {/* Agregar */}
      <div className="flex space-x-2 mt-3 justify-end">
        {totalSupply > 1 && !checked && (
          <div className="relative w-full">
            <input
              type="text"
              className={`block w-full p-2.5 ps-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 ${
                error &&
                'border-red-500 focus:ring-red-500 focus:border-red-500'
              }`}
              placeholder="0"
              value={selectedSupply}
              autoComplete="false"
              onInput={handleInputChange}
              required
            />
            <button
              type="submit"
              className="text-white absolute end-2 bottom-2 bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-xs px-2 py-1"
              onClick={handleSelectAllSupply}
            >
              All
            </button>
          </div>
        )}
        <div className="flex items-center">
          <button
            disabled={
              (error || selectedSupply === '' || selectedSupply === '0') &&
              totalSupply !== 1
                ? true
                : false
            }
            type="button"
            className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-xs px-3 py-3"
            onClick={handleCheckAsset}
          >
            {checked ? 'Remover' : 'Agregar'}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">Fondos insuficientes</p>
      )}
    </div>
  );
}
