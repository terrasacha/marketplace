import { useContext, useState } from 'react';
import {
  UtxoInfoCard,
  CopyToClipboard,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  CubeSendIcon,
  TransferInIcon,
} from '../../ui-lib';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface TransactionInfoCardProps {
  tx_type: string;
  title: string;
  subtitle: string;
  is_collapsed: boolean;
  tx_id: string;
  block: number;
  tx_size: number;
  tx_value: string;
  tx_fee: string;
  tx_assets: Array<any>;
  inputUTxOs: Array<any>;
  outputUTxOs: Array<any>;
  metadata: Array<string>;
  className?: string;
}

export default function TransactionInfoCard(props: TransactionInfoCardProps) {
  const {
    tx_id,
    tx_type,
    tx_value,
    tx_size,
    tx_fee,
    tx_assets,
    title,
    block,
    subtitle,
    inputUTxOs,
    outputUTxOs,
    is_collapsed,
    metadata,
    className,
  } = props;

  const [collapsed, setCollapsed] = useState(is_collapsed);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const metadataJson = {
    msg: metadata,
  };

  const isPositiveValue = (adaValue: string) => {
    if (adaValue.length === 0) {
      return false;
    }
    const firstChar = adaValue.charAt(0);

    return !(firstChar === '-');
  };

  return (
    <div
      className={`${className} shadow-[rgba(221,222,227,1)_1px_1px_4px_0px]`}
    >
      {/* <div className="flex-col">
        <p className="font-semibold">Vista previa transacción</p>
        <p>
          Las direcciones marcadas como "propias" pertenecen a su billetera.
          'ext' marca direcciones de billetera externa
        </p>
      </div> */}
      <div className="border p-4 grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
        {/* Lo que será enviado más fees */}
        <div className="col-span-2 cursor-pointer" onClick={toggleCollapse}>
          <div className="flex justify-between items-center">
            <div className="flex-col">
              <div className="flex">
                <div>
                  {tx_type === 'received' && (
                    <TransferInIcon className="mr-2 h-5 w-5" />
                  )}
                  {tx_type === 'sent' && (
                    <CubeSendIcon className="mr-2 h-6 w-6" />
                  )}
                </div>

                <p className="font-semibold">{title}</p>
              </div>
              <div className="flex items-center space-x-2">
                {!collapsed ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5" />
                )}
                <p>{subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`${
                  isPositiveValue(tx_value) ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {tx_value}
              </p>
              {tx_assets.map((asset: any, index: number) => {
                if(index < 2) {
                  return (
                    <p key={index}>
                      {tx_type === 'sent' || tx_type === 'preview' ? '- ' : '+ '}
                      <span className="font-semibold">
                        {parseFloat(asset.quantity).toLocaleString('es-CO')}
                      </span>
                      {' ' + asset.name}
                    </p>
                  );
                }
              })}
              {tx_assets.length > 2 && (
                <p>
                  Otros{' '}
                  <span className="font-semibold">{tx_assets.length - 2}</span>{' '}
                  Tokens
                </p>
              )}
            </div>
          </div>
        </div>
        {!collapsed && (
          <>
            {/* Transaction id */}
            <div className="col-span-2 border-b border-t py-2">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="flex flex-row lg:flex-col justify-between">
                  <div className="flex items-center">
                    <p>ID de la Transacción</p>
                    <CopyToClipboard
                      iconClassName="h-5 w-5 ml-2 hover:text-blue-600"
                      copyValue={tx_id}
                      tooltipLabel="Copiar !"
                    />
                  </div>
                  <p className="text-wrap break-all">{tx_id}</p>
                </div>
                <div className="flex flex-row lg:flex-col justify-between">
                  <p>{tx_type === 'preview' ? 'Tamaño Tx' : 'Bloque'}</p>
                  <p className="lg:text-center">
                    {tx_type === 'preview' ? tx_size : block}
                  </p>
                </div>
                <div className="flex flex-row lg:flex-col justify-between">
                  <p className="lg:text-end">Fee</p>
                  <p className="text-red-500">{tx_fee}</p>
                </div>
              </div>
            </div>
            {metadata.length > 0 && (
              <div className="col-span-2 border-b py-2">
                <div className="flex items-center">
                  <p>Metadata</p>
                  <CopyToClipboard
                    iconClassName="h-5 w-5 ml-2 hover:text-blue-600"
                    copyValue={JSON.stringify(metadataJson)}
                    tooltipLabel="Copiar !"
                  />
                </div>
                <JsonView
                  data={metadataJson}
                  shouldExpandNode={allExpanded}
                  style={defaultStyles}
                />
              </div>
            )}
            {/* UTXO Input */}
            <div className="col-span-2 lg:col-span-1">
              <p>{inputUTxOs.length + ' UTxO Input(s)'}</p>
              <div className="flex flex-col space-y-1">
                {inputUTxOs.map((utxo: any, index: number) => {
                  return (
                    <UtxoInfoCard
                      key={index}
                      address={utxo.address}
                      isOwnerAddress={utxo.isOwnerAddress}
                      intValuePart={utxo.formatedADAValue.intPart}
                      floatValuePart={utxo.formatedADAValue.floatPart}
                      asset_list={utxo.asset_list}
                      tx_hash={utxo.tx_hash}
                    />
                  );
                })}
              </div>
            </div>
            {/* UTXO Output */}
            <div className="col-span-2 lg:col-span-1">
              <p>{outputUTxOs.length + ' UTxO Output(s)'}</p>
              <div className="flex flex-col space-y-1">
                {outputUTxOs.map((utxo: any, index: number) => {
                  return (
                    <UtxoInfoCard
                      key={index}
                      address={utxo.address}
                      isOwnerAddress={utxo.isOwnerAddress}
                      intValuePart={utxo.formatedADAValue.intPart}
                      floatValuePart={utxo.formatedADAValue.floatPart}
                      asset_list={utxo.asset_list}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
