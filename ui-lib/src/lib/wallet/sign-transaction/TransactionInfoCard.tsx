import { useContext, useState } from 'react';
import { UtxoInfoCard, CopyToClipboard } from '../../ui-lib';

interface TransactionInfoCardProps {
  tx_type: string;
  title: string;
  subtitle: string;
  collapsed: boolean;
  tx_id: string;
  block: number;
  tx_size: number;
  tx_value: string;
  tx_fee: string;
  inputUTxOs: Array<any>;
  outputUTxOs: Array<any>;
  newTransactionBuild?: any;
}

export default function TransactionInfoCard(props: TransactionInfoCardProps) {
  const {
    newTransactionBuild,
    tx_id,
    tx_type,
    tx_value,
    tx_size,
    tx_fee,
    title,
    block,
    subtitle,
    inputUTxOs,
    outputUTxOs,
  } = props;

  const getTTLDate = (ttlMs: number) => {
    const fechaActual = new Date();

    fechaActual.setTime(fechaActual.getTime() + ttlMs);

    return fechaActual.toLocaleString();
  };
  return (
    <div>
      {/* <div className="flex-col">
        <p className="font-semibold">Vista previa transacción</p>
        <p>
          Las direcciones marcadas como "propias" pertenecen a su billetera.
          'ext' marca direcciones de billetera externa
        </p>
      </div> */}
      <div className="border p-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Lo que será enviado más fees */}
        <div className="col-span-2 border-b pb-2">
          <div className="flex justify-between">
            <div className="flex-col">
              <p className="font-semibold">{title}</p>
              <p>{subtitle}</p>
            </div>
            <div>
              <p className="text-red-500">{tx_value}</p>
            </div>
          </div>
        </div>
        {/* Transaction id */}
        <div className="col-span-2 border-b pb-2">
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
        {/* UTXO Input */}
        <div className="col-span-2 lg:col-span-1">
          <p>{inputUTxOs.length + ' UTxO Input(s)'}</p>
          <div className="flex flex-col space-y-1">
            {inputUTxOs.map((utxo: any, index: number) => {
              return (
                <UtxoInfoCard
                  key={index}
                  address={utxo.address}
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
                  intValuePart={utxo.formatedADAValue.intPart}
                  floatValuePart={utxo.formatedADAValue.floatPart}
                  asset_list={utxo.asset_list}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
