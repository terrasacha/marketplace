import { useState } from 'react';
import AssetModal from '../../wallet/assets/AssetModal';
import AssetRow from '../../wallet/assets/AssetRow';
interface AssesListProps {
  assetsData: Array<any>;
  itemsPerPage: number;
}

export default function AssetsList(props: AssesListProps) {
  const { assetsData, itemsPerPage } = props;
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const handleOpenAssetModal = (asset: any = null) => {
    setSelectedAsset(asset);
    setOpenModal(!openModal);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assetsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = assetsData.length;
  const canShowPrevious = currentPage > 1;
  const canShowNext = indexOfLastItem < totalItems;

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <>
      {/* Tus activos serán listados acá */}
      <div className="space-y-2">
        {currentItems.map((asset, index) => (
          <div key={index} onClick={() => handleOpenAssetModal(asset)}>
            <AssetRow
              key={index}
              index={index}
              asset_name={asset.asset_name}
              quantity={asset.quantity}
              price={asset.price}
              total={asset.total}
              // Agrega onClick para abrir la modal
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center mt-5">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Mostrando de{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {indexOfFirstItem + 1}
          </span>{' '}
          a{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(indexOfLastItem, totalItems)}
          </span>{' '}
          de un total de{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalItems}
          </span>{' '}
          Activos
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          <button
            className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark rounded-s hover:bg-custom-dark-hover ${
              !canShowPrevious && 'opacity-50 cursor-not-allowed'
            }`}
            onClick={prevPage}
            disabled={!canShowPrevious}
          >
            <svg
              className="w-3.5 h-3.5 me-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5H1m0 0 4 4M1 5l4-4"
              />
            </svg>
            Prev
          </button>
          <button
            className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark border-0 border-s border-gray-700 rounded-e hover:bg-custom-dark-hover ${
              !canShowNext && 'opacity-50 cursor-not-allowed'
            }`}
            onClick={nextPage}
            disabled={!canShowNext}
          >
            Next
            <svg
              className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </button>
        </div>
      </div>
      {openModal && selectedAsset && (
        <AssetModal
          assetData={selectedAsset}
          handleOpenAssetModal={handleOpenAssetModal}
          openModal={openModal}
        />
      )}
    </>
  );
}
