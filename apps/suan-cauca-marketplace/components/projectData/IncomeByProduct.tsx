import TableComponent from "../common/TableComponent";
export default function IncomeByProduct({ projectFinancialInfo }: any) {
  let data = projectFinancialInfo
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Ingresos por producto
        </h5>
      </div>
      <div className="flow-root">
        <div className="relative overflow-x-auto">
          <TableComponent infoTable={data} />
        </div>
      </div>
    </div>
  );
}
