import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ScriptRow from './ScriptRow';

interface AssesListProps {
  scripts: Array<any>;
  itemsPerPage: number;
}

const ScriptsList = (props: AssesListProps) => {
  const { scripts, itemsPerPage } = props;

  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  console.log('indexOfLastItem asset', indexOfLastItem);
  console.log('itemsPerPage asset', itemsPerPage);
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = scripts.slice(indexOfFirstItem, indexOfLastItem);

  const totalItems = scripts.length;
  console.log('totalItems asset', totalItems);
  const canShowPrevious = currentPage > 1;
  const canShowNext = indexOfLastItem < totalItems;

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="relative overflow-x-auto rounded-lg">
      <table className="w-full text-sm text-left rtl:text-righ text-white">
        <thead className="text-xs uppercase bg-custom-dark border-b-8 border-custom-fondo">
          <tr>
            <th scope="col" className="px-6 py-3">
              Script
            </th>
            <th scope="col" className="px-6 py-3">
              PBK
            </th>
            <th scope="col" className="px-6 py-3">
              Address
            </th>
            <th scope="col" className="px-6 py-3">
              Nombre de Token
            </th>
            <th scope="col" className="px-6 py-3">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="space-y-2">
          {scripts &&
            currentItems.map((script: any, index: number) => {
              return (
                <ScriptRow
                  key={index}
                  index={index}
                  scriptName={script.name}
                  pbk={script.pbk}
                  testnetAddr={script.testnetAddr}
                  tokenName={script.token_name}
                />
              );
            })}
        </tbody>
      </table>
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
};

export default ScriptsList;
