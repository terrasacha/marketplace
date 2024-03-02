export default function TokenCard(props: any){
    const { projectName, categoryName} = props
    return(
        <div className="p-4 border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 bg-custom-fondo h-full w-full flex flex-col justify-center items-center animate-fade animate-ease-in animate-duration-300 gap-1">
            <div className="pb-2 h-[70%] flex justify-center items-center ">
                <p className="h-24 w-24 rounded-full bg-custom-dark flex justify-center items-center text-white">{projectName[0].toUpperCase()}</p>
            </div>
            <p className="text-xs font-medium">{categoryName}</p>
            <p className="text-xs font-medium">{projectName}</p>
        </div>
    )
}