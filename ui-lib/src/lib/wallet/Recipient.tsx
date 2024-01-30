import { useState } from 'react';
import { TrashIcon } from '../ui-lib';

interface RecipientProps {
  index: number;
  walletAddress: string;
  adaAmount: number;
  selectedAssets: Array<{ token: any; quantity: any }>;
  canDelete: boolean;
  handleRemoveRecipient: (index: number) => void;
  handleInputChange: (
    index: number,
    field: string,
    value: string | boolean
  ) => void;
  handleOpenSelectTokensModal: (recipientID: number) => void;
  handleSetSelectedTokensToSelectTokensModal: (data: any) => void;
}

export default function Recipient(props: RecipientProps) {
  const {
    index,
    walletAddress,
    adaAmount,
    selectedAssets = [],
    canDelete,
    handleInputChange,
    handleRemoveRecipient,
    handleOpenSelectTokensModal,
    handleSetSelectedTokensToSelectTokensModal,
  } = props;

  return (
    <div className="grid grid-col-4 gap-2">
      {/* Flex */}
      <div className="col-span-4 flex justify-between">
        <div className="flex justify-center items-center border min-w-11 bg-gray-800 text-white rounded px-3 py-2">
          {index + 1}
        </div>
        {canDelete && (
          <button
            type="button"
            className="text-white min-w-11 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded text-sm px-3 py-2"
            onClick={() => handleRemoveRecipient(index)}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {/* Address Input */}
      <textarea
        id="message"
        rows={4}
        className="block col-span-4 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
        placeholder="Ingresa la dirección de billetera"
        autoComplete="off"
        required
        value={walletAddress}
        onChange={(e) =>
          handleInputChange(index, 'walletAddress', e.target.value)
        }
      ></textarea>
      {/* ADAs */}
      <div className="col-span-4 sm:col-span-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
            t₳
          </div>
          <input
            type="text"
            aria-invalid="false"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
            autoComplete="off"
            placeholder="0.000000"
            required
            value={adaAmount}
            onChange={(e) =>
              handleInputChange(index, 'adaAmount', e.target.value)
            }
          />
        </div>
      </div>
      {/* Token to send */}
      <button
        type="button"
        className="col-span-4 sm:col-span-1 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
        onClick={() => {
          handleSetSelectedTokensToSelectTokensModal(selectedAssets);
          handleOpenSelectTokensModal(index);
        }}
      >
        Agregar Assets {selectedAssets.length > 0 && '(' + selectedAssets.length + ')'}
      </button>
    </div>
  );
}
