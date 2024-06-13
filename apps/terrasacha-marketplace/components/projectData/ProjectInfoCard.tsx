import FormGroup from "../common/FormGroup";

export default function ProjectInfoCard({
  title,
  description,
  area,
  category,
  vereda,
  municipio,
  matricula,
  fichaCatrastal,
}: any) {
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 15.75C3.3375 15.75 2.98438 15.6031 2.69063 15.3094C2.39687 15.0156 2.25 14.6625 2.25 14.25V3.75C2.25 3.3375 2.39687 2.98438 2.69063 2.69063C2.98438 2.39687 3.3375 2.25 3.75 2.25H12L15.75 6V14.25C15.75 14.6625 15.6031 15.0156 15.3094 15.3094C15.0156 15.6031 14.6625 15.75 14.25 15.75H3.75ZM3.75 14.25H14.25V6.75H11.25V3.75H3.75V14.25ZM5.25 12.75H12.75V11.25H5.25V12.75ZM5.25 6.75H9V5.25H5.25V6.75ZM5.25 9.75H12.75V8.25H5.25V9.75Z" fill="#484848" />
        </svg>
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          General
        </h5>
      </div>
      <div className="flow-root">
        <div className="">
          <ul className="general-list pl-1">
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">Nombre del proyecto:</div>
                <div>{title}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">Área total (hectáreas):</div>
                <div>{area}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <span className="general-title font-bold"> Descripción:</span>
                <div>{description}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <span className="general-title font-bold"> Categoria del proyecto:</span>
                <div><span className="text-[#2E7D96] bg-[#D6F8F4] py-1 px-4 rounded text-xs">{category}</span></div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <span className="general-title font-bold">Vereda al que pertenece el predio:</span>
                <div>{vereda}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <span className="general-title font-bold">Municipio al que pertenece el predio:</span>
                <div>{municipio}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
