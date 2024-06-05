import { useContext, useState } from 'react';
;
import CopyToClipboard from '../../common/CopyToClipboard'
import Tooltip from '../../common/Tooltip'
import{ ExternalLinkIcon }from '../../icons/ExternalLinkIcon'
import Link from 'next/link';

interface UtxoInfoCardProps {
  address: string;
  intValuePart: string;
  floatValuePart: string;
  tx_hash?: string;
  asset_list: Array<any>;
  isOwnerAddress: boolean;
}

export default function UtxoJustToken(props: UtxoInfoCardProps) {
  const {
    address,
    intValuePart,
    floatValuePart,
    tx_hash,
    asset_list,
    isOwnerAddress,
  } = props;

  return (
    <div className="flex-col border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] p-2 space-y-2">
      {/* Origin address */}
      <div className="flex items-center">
        <CopyToClipboard
          iconClassName="h-5 w-5 mr-2"
          copyValue={address}
          tooltipLabel="Copiar !"
        />

        <Tooltip text="Consultar en CardanoScan Preview">
          <a
            href={'https://preview.cardanoscan.io/address/' + address}
            target="_blank"
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <div>
                <p className="text-wrap break-all">{address}</p>
                {isOwnerAddress ? (
                  <span className="bg-blue-300 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    Mi billetera
                  </span>
                ) : (
                  <span className="bg-gray-300 text-gray-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                    Externa
                  </span>
                )}
              </div>
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
          t₳ <span className="font-semibold">{intValuePart}</span>
          {floatValuePart}
        </p>
      </div>
      {/* Listado de assets del input UTxO */}
      <div>
        {asset_list.map((asset: any, index: number) => {
          return (
            <div key={index} className="flex justify-end">
              <p>
                <span className="font-semibold">
                  {parseFloat(asset.quantity).toLocaleString('es-CO')}
                </span>{' '}
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
              iconClassName="h-5 w-5 mr-2"
              copyValue={tx_hash}
              tooltipLabel="Copiar !"
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
