import TableComponent from "../common/TableComponent";
import FormGroup from "../common/FormGroup";

export default function CashFlowResume({ cashFlowResume }: any) {
  let data = cashFlowResume.flujos_de_caja
  let TIR = cashFlowResume.TIR
  let VAN = cashFlowResume.VAN
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Productos del ciclo del proyecto
        </h5>
      </div>
      <div className="flow-root">
        <div className="relative overflow-x-auto">
          <FormGroup
            disabled
            label="Tasa interna de retorno"
            inputValue={TIR}
          />
          <FormGroup
            disabled
            label="Valor actual neto"
            inputValue={VAN}
          />
          <TableComponent infoTable={data} typeInfo={'COP'} />
        </div>
      </div>
    </div>
  );
}
