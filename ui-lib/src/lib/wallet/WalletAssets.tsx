import React, { useState } from 'react';
import { Assets } from '../ui-lib';

export default function WalletAssets(props: any) {
  console.log(props.userWalletData);
  return (
    <div className="grid grid-cols-1 ">
      <Assets />
    </div>
  );
}
