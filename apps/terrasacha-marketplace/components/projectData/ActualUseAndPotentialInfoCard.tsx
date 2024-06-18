import { hasNonEmptyValue } from "@terrasacha/lib/util";
export default function ActualUseAndPotentialInfoCard({
  actualUse,
  replaceUse,
}: any) {
  const checkActualUse = hasNonEmptyValue(actualUse)
  const checkReplaceUse = hasNonEmptyValue(replaceUse)
  if(!checkActualUse && !checkReplaceUse) return null
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.3 14.6667H6.7V12H2L4.66667 8.00004H3.33333L8 1.33337L12.6667 8.00004H11.3333L14 12H9.3V14.6667ZM4.5 10.6667H7.16667H5.9H10.1H8.83333H11.5H4.5ZM4.5 10.6667H11.5L8.83333 6.66671H10.1L8 3.66671L5.9 6.66671H7.16667L4.5 10.6667Z" fill="#484848" />
        </svg>
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Uso actual y potencial
        </h5>
      </div>
      <div className="flow-root">
        <div className="">
          <ul className="general-list pl-1 grid sm:grid-cols-2">
            <li className="general-item mb-2">
              <div className="">
                <div className="general-title font-bold">Uso actual del suelo del predio</div>
                <div>{actualUse.types.includes("Potreros") && (
                  <div className="flex pt-4 flex-col sm:flex-row">
                    <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Potreros</span></p>
                    <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.potreros.ha}</span></div>
                  </div>
                )}
                  {actualUse.types.includes("Plantaciones Forestales 1") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Plantaciones Forestales 1</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">Especies: <span className="font-normal">{actualUse.potreros.ha}</span></div>
                        <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.plantacionesForestales1.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {actualUse.types.includes("Plantaciones Forestales 2") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Plantaciones Forestales 2</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">Especies: <span className="font-normal">{actualUse.plantacionesForestales2.especie}</span></div>
                        <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.plantacionesForestales2.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {actualUse.types.includes("Plantaciones Forestales 3") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Plantaciones Forestales 3</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">Especies: <span className="font-normal">{actualUse.plantacionesForestales3.especie}</span></div>
                        <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.plantacionesForestales3.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {actualUse.types.includes("Frutales 1") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Frutales 1</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">Especies: <span className="font-normal">{actualUse.frutales1.especie}</span></div>
                        <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.frutales1.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {actualUse.types.includes("Frutales 2") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Frutales 2</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">Especies: <span className="font-normal">{actualUse.frutales2.especie}</span></div>
                        <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.frutales2.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {actualUse.types.includes("Otros") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Otros</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">Especies: <span className="font-normal">{actualUse.otros.especie}</span></div>
                        <div className="general-title font-bold px-4">Cantidad (héctareas): <span className="font-normal">{actualUse.otros.ha}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="">
                <div className="general-title font-bold">Usos actuales reemplazables</div>
                <div> {replaceUse.types.includes("Potreros") && (
                  <div className="flex pt-4 flex-col sm:flex-row">
                    <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Potreros</span></p>
                    <div className="flex flex-col">
                      <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.potreros.newUse}</span></div>
                      <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{actualUse.otros.ha}</span></div>
                    </div>
                  </div>
                )}
                  {replaceUse.types.includes("Plantaciones Forestales 1") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Plantaciones Forestales 1</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.plantacionesForestales1.newUse}</span></div>
                        <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{replaceUse.plantacionesForestales1.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {replaceUse.types.includes("Plantaciones Forestales 2") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Plantaciones Forestales 2</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.plantacionesForestales2.newUse}</span></div>
                        <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{replaceUse.plantacionesForestales2.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {replaceUse.types.includes("Plantaciones Forestales 3") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Plantaciones Forestales 3</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.plantacionesForestales3.newUse}</span></div>
                        <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{replaceUse.plantacionesForestales3.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {replaceUse.types.includes("Frutales 1") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Frutales 1</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.frutales1.newUse}</span></div>
                        <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{replaceUse.frutales1.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {replaceUse.types.includes("Frutales 2") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Frutales 2</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.frutales2.newUse}</span></div>
                        <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{replaceUse.frutales2.ha}</span></div>
                      </div>
                    </div>
                  )}
                  {replaceUse.types.includes("Otros") && (
                    <div className="flex pt-4 flex-col sm:flex-row">
                      <p><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs font-semibold">Otros</span></p>
                      <div className="flex flex-col">
                        <div className="general-title font-bold px-4">A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.otros.newUse}</span></div>
                        <div className="general-title font-bold px-4">Cantidad de área a remplazar <span className="font-normal">{replaceUse.otros.ha}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div >
  );
}
