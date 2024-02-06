import React, { useContext, useEffect, useState } from 'react';
import { Assets, Card, EyeIcon } from '../ui-lib';
import { CopyIcon } from '../ui-lib';
import { ExternalLinkIcon } from '../ui-lib';
import { Transactions } from '../ui-lib';
import SuanWalletContext from '@suan/store/suanwallet-context';
// Definir el tipo de 'token'
interface AccountProps {
  userWalletData: any;
  address: string;
  ada: number;
  img_url: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function WalletDashboard(props: AccountProps) {
  

  const { walletData } = useContext<any>(SuanWalletContext);

  useEffect(() => {
    if(walletData) {
      
      console.log(walletData);
    }
  }, [walletData]);


  console.log(props.userWalletData);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 xl:space-x-5 ">
      <div className="flex-col col-span-3 space-y-5">
        <Card className="h-fit">
          <Card.Header title="Cuenta" />
          <Card.Body>
            <div className="w-full rounded-lg bg-white p-3">
              <div className="flex gap-3 items-center">
                <div className="flex-none">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-red-200 rounded-lg dark:bg-gray-600">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      NS
                    </span>
                  </div>
                </div>
                <div className="flex-1 w-64">
                  <p className="text-lg">Mi billetera</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 truncate w-52">
                      {walletData ? walletData.address : "loading ..."}
                    </p>
                    <CopyIcon className="h-5 w-5" />
                    <ExternalLinkIcon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl text-green-500">{walletData ? parseInt(walletData.balance) / 1000000 : '0'} ADA</p>
                    <EyeIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
        <div className="h-fit">
          <Transactions />
        </div>
      </div>
      <div className="flex-col col-span-2 space-y-5 mt-5 xl:mt-0">
        <Assets assetsData={walletData && walletData.assets} />
      </div>
    </div>
  );
}
