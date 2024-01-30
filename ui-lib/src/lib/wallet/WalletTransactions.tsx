import React, { useState } from 'react';
import { Assets, Card, EyeIcon } from '../ui-lib';
import { CopyIcon } from '../ui-lib';
import { ExternalLinkIcon } from '../ui-lib';
import { Transactions } from '../ui-lib';

export default function WalletTransactions(props: any) {
  console.log(props.userWalletData);
  return (
    <div className="grid grid-cols-1 ">
      <Transactions />
    </div>
  );
}
