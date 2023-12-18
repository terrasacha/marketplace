import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
}) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onPreviousPage}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <div className="mx-4">{`${currentPage} / ${totalPages}`}</div>
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;