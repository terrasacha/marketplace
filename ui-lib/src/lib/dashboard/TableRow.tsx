
export default function TableRow(props: any) {
   const { 
    key,
    index,
    name,
    txHash,
    tokenName,
    formattedDate,
    amountOfTokens,
    actualPriceToken,
    } = props 


  return (
    <div className="flex space-x-2 items-center border bg-custom-dark text-[#f6f6f6] rounded-md p-4 shadow-[rgba(221,222,227,1)_1px_1px_4px_0px]">
      <div className=''>
        <div className="w-[220px] text-center font-bold">
        <p>{name}</p>
        </div>
      </div>
      <div className="w-[220px] text-center">
        <a
            href={`https://preview.cardanoscan.io/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            >
            {`${txHash.slice(0, 6)}...${txHash.slice(-6)}`}
            </a>
      </div>
      <div className="w-[220px] text-center">
        <p>{tokenName}</p>
      </div>
      <div className="w-[220px] text-center">
        <p>{formattedDate}</p>
      </div>
      <div className="w-[220px] text-center">
        <p>{amountOfTokens}</p>
      </div>
      <div className="w-[220px] text-center">
        <p>{actualPriceToken}</p>
      </div>
    </div>
  );
}
