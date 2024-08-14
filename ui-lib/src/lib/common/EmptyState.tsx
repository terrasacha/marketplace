import React from 'react';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6">
      <div className="flex flex-col items-center">
        {/* Ícono */}
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-40 w-40 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 11h4m-2 4h6m-3 4h-4m-5-6h.01M11 5h5l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h1m5-2h.01M12 3v4h4"
            />
          </svg>
        </div>

        {/* Mensaje */}
        <p className="text-center text-gray-500 text-xl">
          {message}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
