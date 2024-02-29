import { useRouter } from "next/router";

export default function ItemRow(props: any) {

    const { 
        projectName,
        amountOfTokens,
        projectID
     } = props 
    const router = useRouter()
 
   return (
     <div className="flex justify-around space-x-2 items-center bg-custom-dark-hover text-white rounded-lg px-3 py-2">
       <div className=''>
         <div className="w-[220px] text-center">
         <p>{projectName}</p>
         </div>
       </div>
       <div className="w-[220px] text-center">
         <p>{amountOfTokens}</p>
       </div>
       <div className="w-[220px] text-center">
            <button 
                onClick={() => router.push(`/projects/${projectID}/dashboard`)}
                className="flex justify-center text-custom-dark bg-white hover:bg-[#F6F6F6] focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5">
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
 