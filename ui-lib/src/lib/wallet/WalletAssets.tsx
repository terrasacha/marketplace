import React, { useContext, useState } from 'react';
import { Assets } from '../ui-lib';
import { WalletContext } from '@marketplaces/utils-2';

export default function WalletAssets(props: any) {
  const { walletData } = useContext<any>(WalletContext);
  console.log(props.userWalletData);
  return (
    <div className="grid grid-cols-1">
      <Assets assetsData={walletData && walletData.assets} chartActive={false} tableActive={true} tableItemsPerPage={20}/>
    </div>
  );
}
