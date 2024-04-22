import { useState } from 'react';
import { Modal, Button } from 'flowbite-react';
import { AssetRow, CopyToClipboard } from '../../ui-lib'; // Importa AssetRow desde la ubicación correcta
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';

function AssetModal({ assetData, onClose, modalSize }) {
  return (
<Modal show={true} onClose={onClose} size={modalSize} className='justify-center'>
  <Modal.Header className=''>{assetData.asset_name}</Modal.Header>
  <Modal.Body>
    <div className="flex bg-custom-dark text-white rounded-lg justify-evenly	p-6 ">
      {/* Primera columna (30% de ancho) */}
      <div className="w-30 p-3 pt-10">
        <img src="https://kiosuanbcrjsappcad3eb2dd1b14457b491c910d5aa45dd145518-dev.s3.amazonaws.com/public/category-projects-images/Mixto_token.png" alt="Asset Image" className="w-80 h-auto" />
        <h1 className='text-white text-center my-4 text-2xl'>{assetData.asset_name}</h1>
      </div>
      {/* Segunda columna (70% de ancho) */}
      <div className="w-70 p-3 overflow-y-scroll">
        <table className="w-full">
          <tbody className='activos fila_activos'>
            <tr className='bg-gray-600'>
              <td>Decimals: </td>
              <td className='mr-3'>
                {assetData.decimals}
              </td>
              <td>Quantity: </td>
              <td>
                {assetData.quantity}
              </td>
            </tr>
          </tbody>
      </table>
        <hr className="my-2"/>
        <h3 className='font-extrabold		'>Blockchain Data</h3>
      <table className="w-full">
        <tbody className='fila_activos'>
          <tr>
            <td>Policy ID:</td>
            <td>
              {assetData.policy_id}
              <CopyToClipboard
                iconClassName="h-5 w-5 mr-2"
                copyValue={assetData.policy_id}
                tooltipLabel="Copiar !"
              />
            </td>
          </tr>
          <tr className='bg-gray-600'>
            <td>Fingerprint:</td>
            <td>
              {assetData.fingerprint}
              <CopyToClipboard
                iconClassName="h-5 w-5 mr-2"
                copyValue={assetData.fingerprint}
                tooltipLabel="Copiar !"
              />
            </td>
          </tr>
          <tr>
            <td>Asset Name:</td>
            <td>
              {assetData.fingerprint}
              <CopyToClipboard
                iconClassName="h-5 w-5 mr-2"
                copyValue={assetData.asset_name}
                tooltipLabel="Copiar !"
              />
            </td>
          </tr>
          </tbody>
          </table>
          <hr className="my-2"/>
        {/* Información adicional: Metadata */}
        <div className="">
          <h2 className="font-extrabold		">Metadata</h2>

          <table className="w-full">
        <tbody className='fila_activos'>
          <tr className='bg-gray-600'>
            <td>Area:</td>
            <td>
              10              
            </td>
          </tr>
          <tr>
            <td>Category:</td>
            <td>
              PROYECTO_PLANTACIONES
            </td>
          </tr>
          <tr className='bg-gray-600'>
            <td>Create at:</td>
            <td>
              12/05/2022
            </td>
          </tr>
          </tbody>
          </table>
        </div>
        <hr className="my-2"/>
        {/* Información adicional: Raw JSON */}
        <div className="px-3">
          <h2 className="font-extrabold	">Raw JSON</h2>
          <JsonView
                  data={assetData}
                  shouldExpandNode={allExpanded}
                  style={defaultStyles}
                />
        </div>
      </div>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={onClose}>Cerrar</Button>
  </Modal.Footer>
</Modal>


  );
}

export default function AssetsList(props) {
  const { assetsData, itemsPerPage } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalSize, setModalSize] = useState<string>('4xl');

  const openAssetModal = (asset) => {
    setSelectedAsset(asset);
    setOpenModal(true);
  };

  const closeModal = () => {
    setSelectedAsset(null);
    setOpenModal(false);
  };


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
    <div>
      {/* Tus activos serán listados acá */}
      <div className="space-y-2">
        {currentItems.map((asset, index) => (
          <div key={index} onClick={() => openAssetModal(asset)}>
          <AssetRow
            key={index}
            index={index}
            asset_name={asset.asset_name}
            quantity={asset.quantity}
            price={asset.price}
             // Agrega onClick para abrir la modal
          /></div>
        ))}
      </div>
      {openModal && selectedAsset && (
        <AssetModal assetData={selectedAsset} onClose={closeModal} modalSize={modalSize} />
      )}
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
    </div>
  );
}
