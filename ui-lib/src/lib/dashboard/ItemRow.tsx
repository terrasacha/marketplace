import { useRouter } from 'next/router';

export default function ItemRow(props: any) {
  const { projectName, amountOfTokens, productID } = props;
  const router = useRouter();

  return (
    <div className="flex justify-around space-x-2 items-center bg-custom-dark-hover text-white rounded-lg p-3 mt-2">
      <div className="flex justify-start items-center w-[400px] space-x-2">
        <div className="relative inline-flex items-center justify-center w-7 h-7 overflow-hidden bg-white rounded-full">
          <span className="font-medium text-custom-dark dark:text-gray-300">
            {projectName.charAt(0)}
          </span>
        </div>
        <p>{projectName}</p>
      </div>
      <div className="w-[220px] text-center">
        <p>{amountOfTokens}</p>
      </div>
      <div className="w-[220px] text-center">
        <button
          onClick={() => router.push(`/projects/${productID}/dashboard`)}
          className="flex justify-center text-custom-dark bg-white hover:bg-[#F6F6F6] focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5"
        >
          Ir a dashboard del proyecto
        </button>
      </div>
    </div>
  );
}
/* 
 <tr key={index} className="border-t text-gray-500">
              <td className="px-6 py-4">{item.projectName}</td>
              <td className="px-6 py-4 text-center">{item.amountOfTokens}</td>
              <td className="px-6 py-4 flex justify-center">
                <button 
                  onClick={() => router.push(`/projects/${item.projectID}/dashboard`)}
                  className="flex justify-center text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5">
                  Ir a dashboard del proyecto
                </button>
              </td>
            </tr> */
