import React, { useState } from 'react';
import Scripts from './scripts/Scripts';
import { Card, PlusIcon } from '../ui-lib';

export default function CoreWallet(props: any) {
  return (
    <div className="grid grid-cols-2 ">
      <div className="col-span-2">
        <Scripts />
      </div>
    </div>
  );
}
