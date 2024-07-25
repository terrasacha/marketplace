import React from 'react';

const DashboardProjectSkeleton = () => {
  return (
    <div className="bg-[#F4F8F9] h-auto w-full px-5 pt-10 animate-pulse">
      <div className="h-8 bg-gray-300 rounded-full w-60 mb-4"></div>

      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3">
        <div className="row-span-2 lg:col-span-1 2xl:col-span-1 lg:row-span-2">
          <div className="h-60 bg-gray-300 rounded-md"></div>
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="lg:col-span-1">
            <div className="h-28 bg-gray-300 rounded-md"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3 mt-4">
        <div className="bg-gray-300 p-4 rounded-md shadow-lg col-span-2 row-span-6 lg:col-span-2 2xl:col-span-3 lg:row-span-6 flex flex-col h-[40rem] mb-4"></div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="lg:grid-cols-1">
            <div className="h-28 bg-gray-300 rounded-md mb-2"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-9 2xl:grid-cols-9 2xl:grid-rows-2 lg:grid-rows-2 gap-6 mt-4">
        <div className="lg:col-span-6 lg:row-span-2">
          <div className="h-[36rem] bg-gray-300 rounded-md mb-4"></div>
        </div>
        <div className="lg:col-span-3 lg:row-span-2">
          <div className="h-[36rem] bg-gray-300 rounded-md mb-4"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProjectSkeleton;
