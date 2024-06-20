import React, { useContext, useEffect, useState } from 'react';
import Card from '../../common/Card'
import {LoadingIcon} from '../../icons/LoadingIcon'
import {PencilIcon} from '../../icons/PencilIcon'
import { toast } from 'sonner';
import { WalletContext } from '@marketplaces/utils-2';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import AchievementsTable from './AchivementsTable';
// Definir el tipo de 'token'
interface AccountProps {
  userWalletData: any;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function Achievements(props: AccountProps) {
  console.log(props.userWalletData);
  return (
    <>
      <div className="grid grid-cols-6 gap-5">
        <Card className="col-span-6 xl:col-span-6 h-fit">
          <Card.Header title="Tus logros" />
          <Card.Body className="space-y-4">
            <div className='mt-[-1rem] flex items-center'>
                <p>Si compartes tus logros, ¡duplicaremos los puntos ganados!</p>
                <button className='ml-2 rounded-md bg-[#323233] text-white p-[.25rem] pr-[.35rem]'>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1.75"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-share"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>
                </button>
            </div>
            <AchievementsTable totalPoints={24}/>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
