import { hasNonEmptyValue } from "@terrasacha/lib/util";
export default function UserRestrictionsInfoCard({ description, other }: any) {
  const checkDescription = hasNonEmptyValue(description)
  const checkOther = hasNonEmptyValue(other)
  if(!checkDescription && !checkOther) return null
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.7499 9.20837V2.83337H14.1666V9.20837H12.7499ZM2.83325 14.1667V2.83337H4.24992V14.1667H2.83325ZM7.79159 5.66671V2.83337H9.20825V5.66671H7.79159ZM7.79159 9.91671V7.08337H9.20825V9.91671H7.79159ZM7.79159 14.1667V11.3334H9.20825V14.1667H7.79159ZM10.926 14.574L12.4312 13.0688L10.926 11.5813L11.9353 10.5719L13.4405 12.0771L14.9458 10.5719L15.9374 11.5813L14.4322 13.0865L15.9197 14.5917L14.9458 15.5834L13.4228 14.0782L11.9176 15.5834L10.926 14.574Z" fill="#484848" />
        </svg>
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Limitaciones de uso de suelo
        </h5>
      </div>
      <div className="flow-root">
        <div className="">
          <ul className="general-list pl-1">
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">Restricción de uso por encontrarse inmerso en áreas de protección declaradas como parques, zonas de reserva, otros: </div>
                <div>{description}</div>
              </div>
            </li>
            <li className="general-item mb-2">
              <div className="grid sm:grid-cols-2">
                <div className="general-title font-bold">Otros limitantes: </div>
                <div>{other}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
