import React, { useState } from 'react';
import { Card, EyeIcon } from '../ui-lib';
import { CopyIcon } from '../ui-lib';
import { ExternalLinkIcon } from '../ui-lib';

// Definir el tipo de 'token'
interface AccountProps {
  address: string;
  ada: number;
  img_url: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function Account(props: AccountProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 xl:space-x-5 ">
      <div className="flex-col col-span-2 space-y-5">
        <Card className="h-fit">
          <Card.Header title="Accounts" />
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
                  <p className="text-lg">My Wallet</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 truncate w-52">
                      stake_test1uqwder2p9flvw822yaadml8vfw5vgrazupch6ywjdcc98pcapc6qz
                    </p>
                    <CopyIcon className="h-5 w-5" />
                    <ExternalLinkIcon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl text-green-500">0 ADA</p>
                    <EyeIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card className="col-span-2 h-fit">
          <Card.Header title="Transactions" />
          <Card.Body>
            <div className="h-48">Hola</div>
          </Card.Body>
        </Card>
      </div>
      <div className="flex-col space-y-5 mt-5 xl:mt-0">
        <Card>
          <Card.Header title="Assets" tooltip="See all" />
          <Card.Body>
            <div className="flex items-center justify-center h-56">Your assets will be listed here</div>
          </Card.Body>
        </Card>
        <Card className="h-fit">
          <Card.Header title="Address Book" />
          <Card.Body>
            <div className="flex items-center justify-center h-56">Your address book</div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
