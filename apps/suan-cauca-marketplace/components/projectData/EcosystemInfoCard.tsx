import { hasNonEmptyValue } from "@cauca/lib/util";

export default function EcosystemInfoCard({ projectEcosystem }: any) {
  const checkProjectEcosystem = hasNonEmptyValue(projectEcosystem)
  if(!checkProjectEcosystem) return null
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_28_310)">
            <path d="M4.95833 15.5833V12.75H0L2.72708 8.49996H1.41667L6.375 1.41663L8.5 4.46246L10.625 1.41663L15.5833 8.49996H14.2729L17 12.75H12.0417V15.5833H9.20833V12.75H7.79167V15.5833H4.95833ZM11.8469 11.3333H14.4146L11.6698 7.08329H12.8562L10.625 3.89579L9.36771 5.68433L11.3333 8.49996H10.0229L11.8469 11.3333ZM2.58542 11.3333H10.1646L7.41979 7.08329H8.60625L6.375 3.89579L4.14375 7.08329H5.33021L2.58542 11.3333ZM2.58542 11.3333H5.33021H4.14375H8.60625H7.41979H10.1646H2.58542ZM11.8469 11.3333H10.0229H11.3333H9.36771H12.8562H11.6698H14.4146H11.8469Z" fill="#484848" />
          </g>
          <defs>
            <clipPath id="clip0_28_310">
              <rect width="17" height="17" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Aspectos generales del ecosistema
        </h5>
      </div>
      <div className="flow-root">
        <div className="">
          <ul className="general-list pl-1">
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Existen Nacimientos de agua?</div>
                <div>{projectEcosystem?.waterSprings.exist}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Existen concesiones de agua?</div>
                <div>{projectEcosystem?.concessions.exist}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Qué amenazas de deforestación existen al interior del predio(s) y/o a los alrededores?</div>
                <div>{projectEcosystem?.deforestationThreats}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Existe algún proyecto de conservación en su predio?</div>
                <div>{projectEcosystem?.conservationProjects}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuenta con especies de fauna de importancia?</div>
                <div>{projectEcosystem?.diversity.fauna}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuenta con caracterización de especies de mamiferos?</div>
                <div>{projectEcosystem?.diversity.mammals}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuenta con caracterización de especies de aves?</div>
                <div>{projectEcosystem?.diversity.birds}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuenta con caracterización de especies de flora?</div>
                <div>{projectEcosystem?.diversity.flora}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
