import { useState } from 'react';
import { PencilIcon} from '../../icons/PencilIcon';

interface AssetsFilterProps {
  assetsFilter: any;
  handleInputChange: (field: string, value: string) => void;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function SelectTokensModal(props: AssetsFilterProps) {
  const { assetsFilter, handleInputChange } = props;

  return (
    <div>
      <p>Filtrar Tokens</p>
      <div className="flex space-x-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
            <PencilIcon className="w-5 h-5" />
          </div>
          <input
            className="block ps-10 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar ..."
            value={assetsFilter.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </div>
        <ul className="flex space-x-1">
          <li>
            <input
              type="radio"
              id="all"
              value="all"
              checked={assetsFilter.type === 'all'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="hidden peer"
              required
            />
            <label
              htmlFor="all"
              className="inline-flex items-center justify-center min-w-12 p-2 text-gray-500 bg-white border border-gray-200 rounded cursor-pointer  peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 "
            >
              <div className="block">
                <div className="w-full text-md font-semibold">ALL</div>
              </div>
            </label>
          </li>
          <li>
            <input
              type="radio"
              id="ft"
              value="ft"
              checked={assetsFilter.type === 'ft'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="hidden peer"
            />
            <label
              htmlFor="ft"
              className="inline-flex items-center justify-center min-w-12 p-2 text-gray-500 bg-white border border-gray-200 rounded cursor-pointer  peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 "
            >
              <div className="block">
                <div className="w-full text-md font-semibold">FT</div>
              </div>
            </label>
          </li>
          <li>
            <input
              type="radio"
              id="nft"
              value="nft"
              checked={assetsFilter.type === 'nft'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="hidden peer"
            />
            <label
              htmlFor="nft"
              className="inline-flex items-center justify-center min-w-12 p-2 text-gray-500 bg-white border border-gray-200 rounded cursor-pointer  peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 "
            >
              <div className="block">
                <div className="w-full text-md font-semibold">NFT</div>
              </div>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
}
