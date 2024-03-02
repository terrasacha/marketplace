import React from 'react';
import { useRouter } from 'next/router';
import ItemRow from './ItemRow';
const DetailItems = (props: any) => {
  const { foundElement } = props;
  const router = useRouter()
  
  if (!foundElement) return <></>;
  
  return (
    <div>
      <div className='w-[98%]'>
        <div className="flex space-x-2 items-center px-3 py-2 justify-around">
          <div className="w-[400px] text-left">Nombre del proyecto</div>
          <div className="w-[220px] text-center">Token Comprados</div>
          <div className="w-[220px] text-center">Información detallada</div>
        </div>
      {foundElement.map((item: any, index: number) => (
        <ItemRow projectID={item.projectID} projectName={item.projectName} amountOfTokens={item.amountOfTokens} key={index}/>
        ))}
      </div>
    </div>
  );
};

export default DetailItems;
