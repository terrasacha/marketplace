import { hasNonEmptyValue } from "@terrasacha/lib/util";
import FormGroup from "../common/FormGroup";

export default function PropertyInfoCard({ projectGeneralAspects }: any) {
  const checkProjectGeneralAspects = hasNonEmptyValue(projectGeneralAspects)
  if(!checkProjectGeneralAspects) return null
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.25 16.5V13.5H4.5L2.25 11.25L4.5 9H8.25V7.5H3V3H8.25V1.5H9.75V3H13.5L15.75 5.25L13.5 7.5H9.75V9H15V13.5H9.75V16.5H8.25ZM4.5 6H12.8813L13.6313 5.25L12.8813 4.5H4.5V6ZM5.11875 12H13.5V10.5H5.11875L4.36875 11.25L5.11875 12Z" fill="#484848" />
        </svg>

        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Aspectos generales del predio
        </h5>
      </div>
      <div className="flow-root">
        <div className="">
          <ul className="general-list pl-1">
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Usted habita el predio?</div>
                <div>{projectGeneralAspects.postulant.livesOnProperty}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Existen caminos vecinales o servidumbres de paso a otras fincas?</div>
                <div>{projectGeneralAspects.neighborhoodRoads}</div>
                {projectGeneralAspects.postulant.livesOnProperty === "Si" && (
                  <div className="col">
                    <FormGroup
                      disabled
                      label="¿Usted habita el predio de manera temporal o permanente?"
                      inputType="radio"
                      optionList={["Temporal", "Permanente"]}
                      optionCheckedList={projectGeneralAspects.postulant.typeOfStay}
                    />
                  </div>
                )}
                {projectGeneralAspects.postulant.typeOfStay === "Permanente" && (
                  <div className="col">
                    <FormGroup
                      disabled
                      label="¿Desde hace cuántos años ha estado habitando el predio?"
                      inputType="radio"
                      optionList={["Temporal", "Permanente"]}
                      optionCheckedList={
                        projectGeneralAspects.postulant.timeLivingOnProperty
                      }
                    />
                  </div>
                )}
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuántas viviendas hay en el predio(s)?</div>
                <div>{projectGeneralAspects.households}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuántas familas?</div>
                <div>{projectGeneralAspects.familiesNumber}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuál es el estado de las vías de ingreso a su propiedad?</div>
                <div>{projectGeneralAspects.roadsStatus}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuál es la distancia en kilómetros entre el predio y la cabecera municipal?</div>
                <div>{projectGeneralAspects.municipalDistance}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Qué medio de transporte utiliza?</div>
                <div>{projectGeneralAspects.conveyance}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿En su predio existen riesgos de erosión o derrumbes?</div>
                <div>{projectGeneralAspects.collapseRisk}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
