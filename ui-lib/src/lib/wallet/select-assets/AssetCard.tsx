import { useEffect, useState } from 'react';

interface AssetCardProps {
  fingerprint: string;
  assetName: string;
  policy_id: string;
  availableSupplyValue: string;
  recipientID: number;
  selectedSupplyValue: string;
  isChecked: boolean;
  handleAddCheckedAsset: (checkedAsset: any) => void;
  handleRemoveCheckedAsset: (
    fingerprintToRemove: string,
    recipientIDToRemove: number
  ) => void;
  handleAssetQuantityValue: (fingerprint: string, value: string) => void;
}

export default function AssetCard(props: AssetCardProps) {
  const {
    fingerprint,
    assetName,
    policy_id,
    availableSupplyValue,
    recipientID,
    selectedSupplyValue = '',
    isChecked = false,
    handleAddCheckedAsset,
    handleRemoveCheckedAsset,
    handleAssetQuantityValue,
  } = props;

  const [selectedSupply, setSelectedSupply] = useState<string>(selectedSupplyValue);
  const [availableSupply, setAvailableSupply] = useState<string>(availableSupplyValue);
  const [checked, setChecked] = useState<boolean>(isChecked);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setAvailableSupply(availableSupplyValue);
    setSelectedSupply(selectedSupplyValue);
    setChecked(isChecked);
  }, [recipientID, selectedSupplyValue, isChecked, availableSupplyValue]);

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setSelectedSupply(value.replace(/[^0-9]/g, ''));
    validateSupply(parseInt(value));
  };

  const validateSupply = (supply: number) => {
    if (supply > parseInt(availableSupply)) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleSelectAllSupply = () => {
    setSelectedSupply(availableSupply);
  };

  const handleCheckAsset = () => {
    let checkedAsset = {
      recipientID: recipientID,
      fingerprint: fingerprint,
      assetName: assetName,
      policy_id: policy_id,
      selectedSupply: selectedSupply,
    };

    if (checked) {
      setChecked(false);
      handleRemoveCheckedAsset(checkedAsset.fingerprint, checkedAsset.recipientID);
      setSelectedSupply('');
      console.log("Asset removed:", checkedAsset);
    } else {
      setChecked(true);
      if (availableSupply === '1') {
        checkedAsset.selectedSupply = '1';
        setSelectedSupply('1');
      }
      handleAddCheckedAsset(checkedAsset);
      console.log("Asset added:", checkedAsset);
    }
  };

  const totalAssets = String(parseInt(availableSupply) + parseInt(selectedSupply || '0'));

  return (
    <>
      {(checked || parseInt(availableSupply || "0") > 0) && (
        <div className="border w-full p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-none">
              <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-red-200 rounded-full dark:bg-gray-600">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  NS
                </span>
              </div>
            </div>
            <div className="w-full">
              <p className='text-wrap break-all'>{assetName}</p>
              <p>{checked ? selectedSupply + ' / ' + totalAssets : availableSupply}</p>
            </div>
          </div>
          <div className="flex space-x-2 mt-3 justify-end">
            {parseInt(availableSupply) > 1 && !checked && (
              <div className="relative w-full">
                <input
                  type="text"
                  className={`block w-full p-2.5 ps-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 ${
                    error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
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
                  onClick={() => handleSelectAllSupply()}
                >
                  All
                </button>
              </div>
            )}
            <div className="flex items-center">
              <button
                disabled={error ? true : false}
                type="button"
                className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-xs px-3 py-3"
                onClick={() => handleCheckAsset()}
              >
                {checked ? 'Remover' : 'Agregar'}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-1">Fondos insuficientes</p>
          )}
        </div>
      )}
    </>
  );
}
