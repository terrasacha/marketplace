import React, { useState } from 'react';
import Transactions from '../wallet/Transactions';

export default function WalletTransactions(props: any) {
  return (
    <div className="grid grid-cols-1 ">
      <Transactions txPerPage={8} />
    </div>
  );
}
