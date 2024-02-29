
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
    <div className="flex space-x-2 items-center bg-custom-dark-hover text-white rounded-lg px-3 py-2">
      <div className=''>
        <div className="w-[220px] text-center">
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
