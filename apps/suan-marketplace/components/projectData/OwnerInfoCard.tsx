export default function OwnerInfoCard({ owners }: any) {
  return (
    <div className="w-full h-fit p-4 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-start mb-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 8.5C6.60625 8.5 5.84115 8.18177 5.20469 7.54531C4.56823 6.90885 4.25 6.14375 4.25 5.25C4.25 4.35625 4.56823 3.59115 5.20469 2.95469C5.84115 2.31823 6.60625 2 7.5 2C8.39375 2 9.15885 2.31823 9.79531 2.95469C10.4318 3.59115 10.75 4.35625 10.75 5.25C10.75 6.14375 10.4318 6.90885 9.79531 7.54531C9.15885 8.18177 8.39375 8.5 7.5 8.5ZM1 15V12.725C1 12.2646 1.11849 11.8414 1.35547 11.4555C1.59245 11.0695 1.90729 10.775 2.3 10.5719C3.13958 10.1521 3.99271 9.83724 4.85937 9.62734C5.72604 9.41745 6.60625 9.3125 7.5 9.3125C8.39375 9.3125 9.27396 9.41745 10.1406 9.62734C11.0073 9.83724 11.8604 10.1521 12.7 10.5719C13.0927 10.775 13.4076 11.0695 13.6445 11.4555C13.8815 11.8414 14 12.2646 14 12.725V15H1ZM2.625 13.375H12.375V12.725C12.375 12.576 12.3378 12.4406 12.2633 12.3187C12.1888 12.1969 12.0906 12.1021 11.9688 12.0344C11.2375 11.6687 10.4995 11.3945 9.75469 11.2117C9.0099 11.0289 8.25833 10.9375 7.5 10.9375C6.74167 10.9375 5.9901 11.0289 5.24531 11.2117C4.50052 11.3945 3.7625 11.6687 3.03125 12.0344C2.90937 12.1021 2.8112 12.1969 2.73672 12.3187C2.66224 12.4406 2.625 12.576 2.625 12.725V13.375ZM7.5 6.875C7.94687 6.875 8.32943 6.71589 8.64766 6.39766C8.96589 6.07943 9.125 5.69687 9.125 5.25C9.125 4.80312 8.96589 4.42057 8.64766 4.10234C8.32943 3.78411 7.94687 3.625 7.5 3.625C7.05312 3.625 6.67057 3.78411 6.35234 4.10234C6.03411 4.42057 5.875 4.80312 5.875 5.25C5.875 5.69687 6.03411 6.07943 6.35234 6.39766C6.67057 6.71589 7.05312 6.875 7.5 6.875Z"
            fill="#484848"
          />
        </svg>
        <h5 className="general-titleTab text-[#484848] leading-none ml-1 dark:text-white">
          Información de titulares
        </h5>
      </div>
      <div className="flow-root">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3">
                Tipo de identificación
              </th>
              <th scope="col" className="px-6 py-3">
                Numero de identificación
              </th>
            </tr>
          </thead>
          <tbody>
            {owners.map((obj: any, index: number) => {
              return (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={index}
                >
                  <td className="px-6 py-4">{obj.name}</td>
                  <td className="px-6 py-4">{obj.docType.toUpperCase()}</td>
                  <td className="px-6 py-4">{obj.docNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
