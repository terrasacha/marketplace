import { useContext, useEffect, useState } from 'react';
import AssetCard from '../../wallet/select-assets/AssetCard';
import Modal from '../../common/Modal';
import { WalletContext } from '@marketplaces/utils-2';

interface SelectTokensModalProps {
  selectTokensModal: { visible: boolean; data: any; recipientID: number };
  handleOpenSelectTokensModal: (recipientID?: number) => void;
  handleSetSelectedTokensToSelectTokensModal: (data: any) => void;
  handleAddRecipientSelectedAssets: (index: number, data: any) => void;
  newTransactionGroup: any;
  handleAddCheckedAsset: (data: any) => void;
  handleRemoveCheckedAsset: (
    fingerprintToRemove: string,
    recipientIDToRemove: number
  ) => void;
  checkedAssetList: Array<any>;
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
    newTransactionGroup,
    checkedAssetList,
    handleAddCheckedAsset,
    handleRemoveCheckedAsset,
  } = props;

  const { walletData } = useContext<any>(WalletContext);

  console.log('walletData.assets:', walletData.assets);

  const [assetsFilter, setAssetsFilter] = useState<{
    search: string;
    type: string;
  }>({
    search: '',
    type: SEARCH_TYPE.ALL,
  });

  const [assetsList, setAssetsList] = useState<Array<any>>(walletData.assets);

  useEffect(() => {
    if (checkedAssetList.length > 0) {
      console.log('walletData.assets:', walletData.assets);
  
      setAssetsList((prevState) => {
        return prevState.map((asset) => {
          const originalAvailableSupply = walletData.assets.find(
            (originalAsset: any) =>
              originalAsset.fingerprint === asset.fingerprint
          ).quantity;

          const usedSupply = checkedAssetList.reduce((acc, current) => {
            if (current.fingerprint === asset.fingerprint) {
              const selectedSupply = parseInt(current.selectedSupply, 10);
              acc += selectedSupply;
            }
            return acc;
          }, 0);
          const availableSupply = String(
            parseInt(originalAvailableSupply) - usedSupply
          );

          const checkedAsset = checkedAssetList
            .filter(
              (checkedAsset: any) =>
                checkedAsset.recipientID === selectTokensModal.recipientID
            )
            .find(
              (checkedAsset: any) =>
                checkedAsset.fingerprint === asset.fingerprint
            );

          if (checkedAsset) {
            console.log('Checked asset found:', checkedAsset);
            return {
              ...asset,
              quantity: availableSupply,
              selectedSupply: checkedAsset.selectedSupply,
              checked: true,
            };
          }

          return {
            ...asset,
            quantity: availableSupply,
            selectedSupply: '',
            checked: false,
          };
        });
      });
    } else {
      setAssetsList(walletData.assets);
    }
    console.log('Assets List after update:', assetsList);
  }, [walletData.assets, checkedAssetList, selectTokensModal]);

  useEffect(()=>{
    console.log(assetsList,'assetsList')
  },[assetsList])

  const handleFilterInputChange = (field: string, value: string) => {
    setAssetsFilter((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAccept = () => {
    const selectedAssets = checkedAssetList.filter(
      (asset) => asset.recipientID === selectTokensModal.recipientID
    );
    console.log('Selected assets before adding to recipient:', selectedAssets);

    handleAddRecipientSelectedAssets(
      selectTokensModal.recipientID,
      selectedAssets
    );
    handleOpenSelectTokensModal();
    setAssetsList(walletData.assets);

    console.log('TotalCheckedAssetList', checkedAssetList);
  };

  const handleAssetQuantityValue = (fingerprint: string, value: string) => {
    setAssetsList((prevState) => {
      return prevState.map((asset) => {
        if (asset.fingerprint === fingerprint) {
          return { ...asset, quantity: value };
        } else {
          return asset;
        }
      });
    });
  };

  return (
    <Modal show={selectTokensModal.visible} size="7xl">
      <Modal.Header
        onClose={() => {
          handleOpenSelectTokensModal();
          handleSetSelectedTokensToSelectTokensModal([]);
          setAssetsList(walletData.assets);
        }}
      >
        Selecciona Assets
      </Modal.Header>
      <Modal.Body>
        <div>
          {assetsList.length > 0 ? (
            <>
              <p>Tús Activos</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {assetsList.map((asset: any, index: number) => {
                  return (
                    <AssetCard
                      key={index}
                      recipientID={selectTokensModal.recipientID}
                      assetName={asset.asset_name}
                      policy_id={asset.policy_id}
                      fingerprint={asset.fingerprint}
                      availableSupplyValue={asset.quantity}
                      selectedSupplyValue={asset.selectedSupply}
                      isChecked={asset.checked}
                      handleAddCheckedAsset={handleAddCheckedAsset}
                      handleRemoveCheckedAsset={handleRemoveCheckedAsset}
                      handleAssetQuantityValue={handleAssetQuantityValue}
                    />
                  );
             
                })}
                
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              No tienes activos disponibles para enviar
            </div>
          )}
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
