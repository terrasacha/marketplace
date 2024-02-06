import { useContext, useState } from 'react';
import {
  Card,
  CopyIcon,
  CopyToClipboard,
  ExternalLinkIcon,
  LockIcon,
  Tooltip,
} from '../../ui-lib';
import Link from 'next/link';

interface UtxoInfoCardProps {
  address: string;
  intValuePart: string;
  floatValuePart: string;
  tx_hash?: string;
  asset_list: Array<any>;
}

export default function UtxoInfoCard(props: UtxoInfoCardProps) {
  const { address, intValuePart, floatValuePart, tx_hash, asset_list } = props;

  return (
    <div className="flex-col border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] p-2 space-y-2">
      {/* Origin address */}
      <div className="flex items-center">
        <CopyToClipboard
          iconClassName="h-5 w-5 mr-2 hover:text-blue-600"
          copyValue={address}
          tooltipLabel='Copiar !'
        />

        <Tooltip text="Consultar en CardanoScan Preview">
          <a
            href={'https://preview.cardanoscan.io/address/' + address}
            target="_blank"
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <p className="text-wrap break-all">{address}</p>
              <div>
                <ExternalLinkIcon className="h-5 w-5 ml-2" />
              </div>
            </div>
          </a>
        </Tooltip>
      </div>
      {/* Adas section */}
      <div className="flex justify-end">
        <p className="">
          t₳{' '}
          <span className="font-semibold">{intValuePart}</span>
          {floatValuePart}
        </p>
      </div>
      {/* Listado de assets del input UTxO */}
      <div>
        {asset_list.map((asset: any, index: number) => {
          return (
            <div key={index} className="flex justify-end">
              <p>
                <span className="font-semibold">{asset.quantity}</span>{' '}
                {asset.asset_name}
              </p>
            </div>
          );
        })}
      </div>
      {/* txHash */}
      {tx_hash && (
        <div>
          <div className="flex">txhash</div>
          <div className="flex items-center">
            <CopyToClipboard
              iconClassName="h-5 w-5 mr-2 hover:text-blue-600"
              copyValue={tx_hash}
              tooltipLabel='Copiar !'
            />

            <Tooltip text="Consultar en CardanoScan Preview">
              <a
                href={'https://preview.cardanoscan.io/transaction/' + tx_hash}
                target="_blank"
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <p className="text-wrap break-all">{tx_hash}</p>
                  <div>
                    <ExternalLinkIcon className="h-5 w-5 ml-2" />
                  </div>
                </div>
              </a>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
