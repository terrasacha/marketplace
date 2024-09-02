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
        className="font-jostBold px-4 py-2  bg-custom-marca-boton-variante  hover:bg-custom-marca-boton-variante2 text-white rounded-md disabled:bg-custom-marca-boton-alterno2 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <div className="mx-4 mt-2 font-jostBold">{`${currentPage} / ${totalPages}`}</div>
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className="font font-jostBold px-4 py-2 enabled:  bg-custom-marca-boton-variante  hover:bg-custom-marca-boton-variante2  text-white rounded-md disabled:bg-custom-marca-boton-alterno2 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;