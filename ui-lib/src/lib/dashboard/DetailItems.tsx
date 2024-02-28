import React from 'react';

const DetailItems = (props: any) => {
  const { foundElement } = props;
  
  if (!foundElement) return <></>;
  
  return (
    <div className="p-6 rounded-sm shadow-md w-full m-4 overflow-x-auto flex justify-center">
      <table className="w-[95%] table-auto">
        <thead>
          <tr className="">
            <th className="px-6 py-3 text-left">Nombre del proyecto</th>
            <th className="px-6 py-3">Cantidad de Tokens</th>
            <th className="px-6 py-3">{" "}</th>
          </tr>
        </thead>
        <tbody>
          {foundElement.map((item: any, index: number) => (
            <tr key={index} className="border-t text-gray-500">
              <td className="px-6 py-4">{item.product}</td>
              <td className="px-6 py-4 text-center">{item.amountOfTokens}</td>
              <td className="px-6 py-4 flex justify-center">
                <button className="flex justify-center text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5">
                  Ir a dashboard del proyecto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailItems;
