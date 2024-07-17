import React, { useContext, useState } from 'react';
import Transactions from '../wallet/Transactions';
import { WalletContext } from '@marketplaces/utils-2';

export default function WalletTransactions(props: any) {
  const { walletData, fetchWalletData, walletID } =
    useContext<any>(WalletContext);
  return (
    <div className="grid grid-cols-1 ">
      <Transactions txPerPage={8} />
    </div>
  );
}
