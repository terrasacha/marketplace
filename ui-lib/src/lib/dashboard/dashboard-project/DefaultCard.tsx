export default function DefaultCard(props: any){
    return(
        <div className="p-4 border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 bg-custom-fondo w-full flex animate-fade animate-ease-in animate-duration-300">
            <div className="flex flex-col justify-start w-[80%]">
                <h4 className="text-lg font-normal">Title</h4>
                <p className="text-xl font-bold">Value</p>
            </div>
            <div className="w-[20%] flex justify-center items-center">
                <p>ICON</p>
            </div>
        </div>
    )
}