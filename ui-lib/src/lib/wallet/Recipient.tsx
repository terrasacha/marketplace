import { useState } from 'react';
import { TrashIcon } from '../icons/TrashIcon';

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

  // Expresión regular para validar el formato de la dirección de billetera
  const isValidWalletAddress = /^addr_[a-z0-9]+$/i.test(walletAddress.trim());

  return (
    <div className="grid grid-col-4 gap-4 p-5 bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-100/50 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Header con número y botón eliminar */}
      <div className="col-span-4 flex justify-between items-center">
        <div className="flex justify-center items-center min-w-11 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante text-white rounded-lg px-4 py-2 shadow-md font-jostBold">
          {index + 1}
        </div>
        {canDelete && (
          <button
            type="button"
            className="text-white min-w-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium rounded-lg text-sm px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => handleRemoveRecipient(index)}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Address Input */}
      <div className="col-span-4">
        <label className="block text-sm font-jostBold text-gray-700 mb-2">
          Dirección de billetera
        </label>
        <textarea
          id={`wallet-address-${index}`}
          rows={4}
          className={`block w-full p-3 text-sm text-gray-900 bg-white rounded-lg border transition-all duration-300 focus:ring-2 ${
            isValidWalletAddress
              ? 'border-gray-200 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton'
              : 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
          }`}
          placeholder="Ingresa una dirección de billetera válida (addr_...)"
          autoComplete="off"
          required
          value={walletAddress}
          onChange={(e) =>
            handleInputChange(index, 'walletAddress', e.target.value)
          }
        ></textarea>
        {!isValidWalletAddress && walletAddress.trim() !== '' && (
          <p className="text-red-500 text-xs mt-1 font-jostRegular animate-fade-in">
            Dirección inválida. Debe comenzar con "addr_"
          </p>
        )}
      </div>
      
      {/* ADAs y Botón Agregar Assets */}
      <div className="col-span-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="col-span-1 sm:col-span-3">
          <label className="block text-sm font-jostBold text-gray-700 mb-2">
            Cantidad de ADA
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
              <span className="text-gray-500 font-jostBold">t₳</span>
            </div>
            <input
              id={`adas-${index}`}
              type="text"
              aria-invalid="false"
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-custom-marca-boton/20 focus:border-custom-marca-boton block w-full ps-10 p-3 transition-all duration-300"
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
        <div className="col-span-1 flex items-end">
          <button
            type="button"
            className={`w-full text-white ${
              isValidWalletAddress
                ? 'bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante hover:from-custom-marca-boton-variante hover:to-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 shadow-md hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            } font-jostBold rounded-lg text-sm px-4 py-3 transition-all duration-300 relative overflow-hidden group`}
            onClick={() => {
              if (isValidWalletAddress) {
                handleSetSelectedTokensToSelectTokensModal(selectedAssets);
                handleOpenSelectTokensModal(index);
              }
            }}
            disabled={!isValidWalletAddress}
          >
            {isValidWalletAddress && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Assets
              {selectedAssets.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {selectedAssets.length}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
      
      {/* Mostrar assets seleccionados */}
      {selectedAssets.length > 0 && (
        <div className="col-span-4 mt-2">
          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset, assetIndex) => (
              <div
                key={assetIndex}
                className="bg-gradient-to-r from-custom-marca-boton-alterno2/20 to-custom-marca-boton-alterno/20 px-3 py-1.5 rounded-lg border border-custom-marca-boton-alterno/30 text-sm font-jostRegular text-gray-700 animate-fade-in"
              >
                {asset.token?.name || asset.token?.fingerprint || 'Token'} ({asset.quantity})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
