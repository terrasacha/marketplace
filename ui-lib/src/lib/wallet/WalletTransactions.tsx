import React, { useContext, useState } from 'react';
import Transactions from '../wallet/Transactions';
import { WalletContext } from '@marketplaces/utils-2';

export default function WalletTransactions(props: any) {
  const { walletData, fetchWalletData, walletID } = useContext<any>(WalletContext);
  return (
    <div className="grid grid-cols-1 ">
      {
        walletID !== "575a7f01272dd95a9ba2696e9e3d4895fe39b12350f7fa88a301b3ad" && (
          <Transactions txPerPage={3} />

        )
      }
    </div>
  );
}
