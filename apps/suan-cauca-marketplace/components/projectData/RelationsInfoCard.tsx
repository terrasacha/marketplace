import { hasNonEmptyValue } from "@cauca/lib/util";
import FormGroup from "../common/FormGroup";

export default function RelationsInfoCard({ projectRelations }: any) {
  const checkProjectRelations = hasNonEmptyValue(projectRelations)
  if(!checkProjectRelations) return null
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.25 16.5V13.5H4.5L2.25 11.25L4.5 9H8.25V7.5H3V3H8.25V1.5H9.75V3H13.5L15.75 5.25L13.5 7.5H9.75V9H15V13.5H9.75V16.5H8.25ZM4.5 6H12.8813L13.6313 5.25L12.8813 4.5H4.5V6ZM5.11875 12H13.5V10.5H5.11875L4.36875 11.25L5.11875 12Z" fill="#484848" />
        </svg>
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Relaciones con entidades y aliados estratégicos
        </h5>
      </div>
      <div className="flow-root">
        <div className="">
          <ul className="general-list pl-1">
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Recibe asistencia técnica en el predio?</div>
                <div>{projectRelations?.technicalAssistance}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Cuenta con aliados estratégicos?</div>
                <div>{projectRelations?.strategicAllies}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">¿Pertenece a algún grupo comunitario?</div>
                <div>{projectRelations?.communityGroups}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
