import { type } from "os";

export default function TableComponent({
    infoTable,
    typeInfo
}: any) {
    const columns = Object.keys(infoTable[0])
    
  return (
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    {columns.map(column =>{
                        return(
                            <th scope="col" className="px-6 py-3" key={column}>
                                {column}
                            </th>
                        )
                    })}
                    {typeInfo && <th scope="col" className="px-6 py-3">UNIDAD</th>}   
                </tr>
            </thead>
            <tbody>
                {infoTable.map((row : any, index: number) =>{
                       return( <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={index}>
                            {columns.map((column: string) => (
                            <td className="px-6 py-4" key={column}>
                                {row[column]}
                            </td>
                        ))}
                        {typeInfo && <td className="px-6 py-4">{typeInfo}</td>}
                        </tr>)
                    })}
            </tbody>
        </table>
  );
}
