import { useEffect, useState } from 'react';
import {
  AssetCard,
  AssetsFilter,
  Modal,
  PencilIcon,
  TrashIcon,
} from '../../ui-lib';

interface SelectTokensModalProps {
  selectTokensModal: { visible: boolean; data: any; recipientID: number };
  handleOpenSelectTokensModal: (recipientID?: number) => void;
  handleSetSelectedTokensToSelectTokensModal: (data: any) => void;
  handleAddRecipientSelectedAssets: (index: number, data: any) => void;
  // Agrega cualquier otra propiedad que tenga tu token
}

const SEARCH_TYPE = {
  ALL: 'all',
  FT: 'ft',
  NFT: 'nft',
};

export default function SelectTokensModal(props: SelectTokensModalProps) {
  const {
    selectTokensModal,
    handleOpenSelectTokensModal,
    handleSetSelectedTokensToSelectTokensModal,
    handleAddRecipientSelectedAssets,
  } = props;

  const [assetsFilter, setAssetsFilter] = useState<{
    search: string;
    type: string;
  }>({
    search: '',
    type: SEARCH_TYPE.ALL,
  });

  const handleFilterInputChange = (field: string, value: string) => {
    setAssetsFilter((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const assetsListDummy = [
    {
      fingerprint: 'asset1ggzjzrvrkhjvgc6tzjp0caewuzhqd3w9xtqgve',
      assetName: 'ProyectoSand',
      totalSupply: 17,
      selectedSupply: '',
      checked: false,
    },
    {
      fingerprint: 'asset1qewdm9y6hyvz5ae7rkq9ewdu38u2lj58cue57f',
      assetName: 'SUAN-3B284DF7FC48',
      totalSupply: 2,
      selectedSupply: '',
      checked: false,
    },
    {
      fingerprint: 'asset1rcgy77sfzs7ym4grmdva7nd5fevt58c9hr7fnn',
      assetName: 'SUAN-97CC4F29C5F0',
      totalSupply: 3,
      selectedSupply: '',
      checked: false,
    },
    {
      fingerprint: 'asset1ggzjzrvrkhjvgc6tzjp0caewuzhqd3w9xtqgva',
      assetName: 'Token NFT Sandbox',
      totalSupply: 1,
      selectedSupply: '',
      checked: false,
    },
  ];

  const [assetsList, setAssetsList] = useState(assetsListDummy);

  useEffect(() => {
    console.log('entro a chequear0');
    const checkedAssets = selectTokensModal.data;
    console.log('checkedAssets', checkedAssets);
    if (checkedAssets.length > 0) {
      console.log('entro a chequear');
      setAssetsList((prevState) => {
        return prevState.map((asset) => {
          const checkedAsset = checkedAssets.find(
            (checkedAsset: any) =>
              checkedAsset.fingerprint === asset.fingerprint
          );

          if (checkedAsset) {
            // El objeto existe en assetListChecked, actualiza los valores
            return {
              ...asset,
              selectedSupply: checkedAsset.selectedSupply,
              checked: checkedAsset.checked,
            };
          }

          // Si el objeto no está en assetListChecked, simplemente devuelve el objeto original
          return asset;
        });
      });
    }
  }, [selectTokensModal.data]);

  // Funcion para actualizar la cantidad de assets seleccionados del mismo tipo para enviar
  const handleAssetSelectedChange = (
    fingerprint: string,
    property: string,
    value: string | boolean | number
  ) => {
    setAssetsList((prevAssetsList) =>
      prevAssetsList.map((asset) =>
        asset.fingerprint === fingerprint
          ? { ...asset, [property]: value }
          : asset
      )
    );
  };
  const handleAccept = () => {
    const selectedAssets = assetsList.filter((asset) => asset.checked);
    //handleSetSelectedTokensToSelectTokensModal(selectedAssets);
    handleAddRecipientSelectedAssets(selectTokensModal.recipientID, selectedAssets);
    handleOpenSelectTokensModal();
    setAssetsList(assetsListDummy)

    console.log(selectedAssets);
  };

  return (
    <Modal show={selectTokensModal.visible} size="7xl">
      <Modal.Header
        onClose={() => {
          handleOpenSelectTokensModal();
          handleSetSelectedTokensToSelectTokensModal([]);
          setAssetsList(assetsListDummy)
        }}
      >
        Selecciona Assets
      </Modal.Header>
      <Modal.Body>
        <AssetsFilter
          assetsFilter={assetsFilter}
          handleInputChange={handleFilterInputChange}
        />
        <div>
          <p>Token Collection</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {assetsList.map((asset, index) => {
              return (
                <AssetCard
                  key={index}
                  assetName={asset.assetName}
                  fingerprint={asset.fingerprint}
                  policyID=""
                  totalSupply={asset.totalSupply}
                  selectedSupply={asset.selectedSupply}
                  checked={asset.checked}
                  handleAssetSelectedChange={handleAssetSelectedChange}
                />
              );
            })}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-end">
        <button
          type="button"
          className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-xs px-3 py-3 w-56"
          onClick={handleAccept}
        >
          Aceptar
        </button>
      </Modal.Footer>
    </Modal>
  );
}
