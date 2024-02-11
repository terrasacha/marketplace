import { getTTLDate, hexToText } from '../utils-2';

interface MapTransactionInfoProps {
  walletAddress: string;
  tx_type: string;
  buildTxResponse: any;
  metadata: Array<string>;
}
interface MappedTransactionInfoProps {
  tx_type: string;
  title: string;
  subtitle: string;
  tx_id: string;
  block: number;
  tx_size: number;
  tx_value: string;
  tx_fee: string;
  inputUTxOs: Array<any>;
  outputUTxOs: Array<any>;
  cbor: string | null;
  metadata: Array<string>;
}

const TRANSACTION_TYPES = {
  SENT: 'sent',
  RECEIVED: 'received',
  PREVIEW: 'preview',
};

function lovelaceToAda(lovelace: number): number {
  return lovelace / 1000000;
}

function formatADAsToString(value: number): string {
  if (value > 0) {
    return `t₳ ${value}`;
  } else if (value < 0) {
    return `- t₳ ${Math.abs(value)}`;
  } else {
    return 't₳ 0';
  }
}

function getTransactionType(valor: number): string {
  if (valor >= 0) {
    return TRANSACTION_TYPES.RECEIVED;
  } else {
    return TRANSACTION_TYPES.SENT;
  }
}

function getNumberParts(value: number) {
  const intPart = Math.floor(value);
  const floatPart = value - intPart;

  return {
    intPart: String(intPart),
    floatPart: floatPart === 0 ? '' : String(floatPart.toFixed(6)).slice(1),
  };
}

function getAssetList(multi_asset: any) {
  const asset_list = [];

  // Recorre cada clave del objeto original
  for (const policy_id in multi_asset) {
    if (multi_asset.hasOwnProperty(policy_id)) {
      // Recorre las propiedades de cada clave
      for (const propiedad in multi_asset[policy_id]) {
        if (multi_asset[policy_id].hasOwnProperty(propiedad)) {
          // Crea un nuevo objeto con los atributos policy_id, nombre y cantidad
          const nuevoObjeto = {
            policy_id,
            asset_name: propiedad,
            quantity: multi_asset[policy_id][propiedad],
          };
          // Agrega el nuevo objeto al array
          asset_list.push(nuevoObjeto);
        }
      }
    }
  }

  return asset_list;
}

export default async function mapTransactionInfo({
  walletAddress,
  tx_type,
  buildTxResponse,
  metadata,
}: MapTransactionInfoProps) {
  console.log('TransactionRawInfoData', buildTxResponse);

  const cbor = buildTxResponse.cbor;
  const tx_id = buildTxResponse.build_tx.tx_id;
  const tx_fee = lovelaceToAda(buildTxResponse.build_tx.fee);
  const tx_size = buildTxResponse.tx_size;
  const input_utxo = Object.values(buildTxResponse.utxos_info).map(
    (utxo: any) => {
      const mappedAssetList = utxo.asset_list.map((asset: any) => {
        return {
          asset_name: hexToText(asset.asset_name),
          fingerprint: asset.fingerprint,
          policy_id: asset.policy_id,
          quantity: parseInt(asset.quantity),
        };
      });
      const isOwnerAddress = walletAddress === utxo.address ? true : false
      return {
        tx_index: utxo.tx_index,
        tx_hash: utxo.tx_hash,
        address: utxo.address,
        isOwnerAddress: isOwnerAddress,
        asset_list: mappedAssetList,
        lovelace: parseInt(utxo.value),
        formatedADAValue: getNumberParts(lovelaceToAda(parseInt(utxo.value))),
      };
    }
  );
  const output_utxo = Object.values(buildTxResponse.build_tx.outputs).map(
    (utxo: any) => {
      const asset_list = getAssetList(utxo.amount.multi_asset);
      const isOwnerAddress = walletAddress === utxo.address ? true : false
      return {
        address: utxo.address,
        isOwnerAddress: isOwnerAddress,
        asset_list: asset_list,
        lovelace: utxo.lovelace,
        formatedADAValue: getNumberParts(lovelaceToAda(utxo.lovelace)),
      };
    }
  );

  // Calcular movimiento de saldo relacionado al address
  let input_utxo_value: number = input_utxo.reduce(
    (acumulador: number, utxo: any) => {
      if (utxo.address === walletAddress) {
        return acumulador + parseInt(utxo.lovelace);
      }
      return acumulador;
    },
    0
  );

  let output_utxo_value: number = output_utxo.reduce(
    (acumulador: number, utxo: any) => {
      if (utxo.address === walletAddress) {
        return acumulador + parseInt(utxo.lovelace);
      }
      return acumulador;
    },
    0
  );

  const tx_value = lovelaceToAda(output_utxo_value - input_utxo_value);
  let title = '';
  let subtitle = '';
  if (tx_type === TRANSACTION_TYPES.RECEIVED) {
    title = 'Fondos recibidos';
    subtitle = '???';
  } else if (tx_type === TRANSACTION_TYPES.SENT) {
    title = 'Fondos enviados';
    subtitle = '???';
  } else if (tx_type === TRANSACTION_TYPES.PREVIEW) {
    title = 'Vista previa: Envio de fondos';
    subtitle = 'Valido hasta: ' + getTTLDate(buildTxResponse.build_tx.ttl);
  }

  const tx_info: MappedTransactionInfoProps = {
    tx_type: tx_type,
    title: title,
    subtitle: subtitle,
    tx_id: tx_id,
    block: 0,
    tx_size: tx_size,
    tx_value: formatADAsToString(tx_value),
    tx_fee: formatADAsToString(-Math.abs(tx_fee)),
    inputUTxOs: input_utxo,
    outputUTxOs: output_utxo,
    cbor: cbor,
    metadata: metadata,
  };

  console.log('tx_info: ', tx_info);

  return tx_info;
}
