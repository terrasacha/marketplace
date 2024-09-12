import {
  assetDifference,
  getDateFromTimeStamp,
  getTTLDate,
  getTimeLive,
  hexToText,
} from '../utils-2';

interface MapBuildTransactionInfoProps {
  walletAddress: string;
  tx_type: string;
  buildTxResponse: any;
  metadata: any;
}
interface MapTransactionListProps {
  walletAddress: string;
  data: Array<any>;
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
  tx_assets: Array<any>;
  tx_time_live?: number;
  inputUTxOs: Array<any>;
  outputUTxOs: Array<any>;
  cbor?: string | null;
  redeemer_cbor?: string | null;
  metadata_cbor?: string | null;
  metadata: Array<string>;
}

const TRANSACTION_TYPES = {
  SENT: 'sent',
  RECEIVED: 'received',
  PREVIEW: 'preview',
  INTERNAL: 'internal',
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

export async function mapBuildTransactionInfo({
  walletAddress,
  tx_type,
  buildTxResponse,
  metadata,
}: MapBuildTransactionInfoProps) {
  const cbor = buildTxResponse.cbor;
  const redeemer_cbor = buildTxResponse.redeemer_cbor;
  const metadata_cbor = buildTxResponse.metadata_cbor;
  const tx_id = buildTxResponse.build_tx.tx_id;
  const tx_fee = lovelaceToAda(buildTxResponse.build_tx.fee);
  const tx_size = buildTxResponse.tx_size;
  const input_utxo = buildTxResponse.utxos_info.map((utxo: any) => {
    const lovelace =
      utxo.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0';

    const mappedAssetList = utxo.amount
      .filter((asset: any) => asset.unit !== 'lovelace')
      .map((asset: any) => {
        const policyId = asset.unit.substring(0, 56);
        const name = asset.unit.substring(56);
        return {
          asset_name: hexToText(name),
          fingerprint: asset.unit, // Asumo que no hay fingerprint en la nueva estructura
          policy_id: policyId, // Asumo que no hay policy_id en la nueva estructura
          quantity: parseInt(asset.quantity),
        };
      });

    const isOwnerAddress = walletAddress === utxo.address ? true : false;

    return {
      tx_index: utxo.output_index,
      tx_hash: utxo.tx_hash,
      address: utxo.address,
      isOwnerAddress: isOwnerAddress,
      asset_list: mappedAssetList,
      lovelace: parseInt(lovelace),
      formatedADAValue: getNumberParts(lovelaceToAda(parseInt(lovelace))),
    };
  });
  const output_utxo = Object.values(buildTxResponse.build_tx.outputs).map(
    (utxo: any) => {
      const asset_list = getAssetList(utxo.amount.multi_asset);
      const isOwnerAddress = walletAddress === utxo.address ? true : false;
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

  const input_utxo_value: {
    value: number;
    totalInputAssets: any;
    totalAssetQuantity: number;
  } = input_utxo.reduce(
    (acumulador: any, utxo: any) => {
      if (utxo.address === walletAddress) {
        const totalAssetQuantity = utxo.asset_list.reduce(
          (sum: any, asset: any) => sum + parseInt(asset.quantity),
          acumulador.totalAssetQuantity
        );
        const totalInputAssets = utxo.asset_list.reduce(
          (acc: any, asset: any) => {
            if (!acc[asset.asset_name]) {
              acc[asset.asset_name] = 0;
            }
            acc[asset.asset_name] =
              acc[asset.asset_name] + parseInt(asset.quantity);
            return acc;
          },
          { ...acumulador.totalInputAssets }
        );
        return {
          value: acumulador.value + parseInt(utxo.lovelace),
          totalInputAssets: totalInputAssets,
          totalAssetQuantity: totalAssetQuantity,
        };
      }
      return acumulador;
    },
    { value: 0, totalAssetQuantity: 0, totalInputAssets: {} }
  );

  const output_utxo_value: {
    value: number;
    totalAssetQuantity: number;
    totalOutputAssets: any;
  } = output_utxo.reduce(
    (acumulador: any, utxo: any) => {
      if (utxo.address === walletAddress) {
        const totalAssetQuantity = utxo.asset_list.reduce(
          (sum: any, asset: any) => sum + parseInt(asset.quantity),
          acumulador.totalAssetQuantity
        );
        const totalOutputAssets = utxo.asset_list.reduce(
          (acc: any, asset: any) => {
            if (!acc[asset.asset_name]) {
              acc[asset.asset_name] = 0;
            }
            acc[asset.asset_name] =
              acc[asset.asset_name] + parseInt(asset.quantity);
            return acc;
          },
          { ...acumulador.totalOutputAssets }
        );
        return {
          value: acumulador.value + parseInt(utxo.lovelace),
          totalOutputAssets: totalOutputAssets,
          totalAssetQuantity: totalAssetQuantity,
        };
      }
      return acumulador;
    },
    { value: 0, totalAssetQuantity: 0, totalOutputAssets: {} }
  );

  const tx_value = lovelaceToAda(
    output_utxo_value.value - input_utxo_value.value
  );

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

  const tx_assets = assetDifference(
    input_utxo_value.totalInputAssets,
    output_utxo_value.totalOutputAssets,
    tx_type
  );
  const tx_assets_mapped = Object.entries(tx_assets).map(
    ([clave, valor]: any) => {
      return {
        name: clave,
        quantity: valor,
      };
    }
  );

  const tx_info: MappedTransactionInfoProps = {
    tx_type: tx_type,
    title: title,
    subtitle: subtitle,
    tx_id: tx_id,
    block: 0,
    tx_size: tx_size,
    tx_value: formatADAsToString(tx_value),
    tx_fee: formatADAsToString(-Math.abs(tx_fee)),
    tx_assets: tx_assets_mapped,
    inputUTxOs: input_utxo,
    outputUTxOs: output_utxo,
    cbor: cbor,
    redeemer_cbor: redeemer_cbor,
    metadata_cbor: metadata_cbor,
    metadata: metadata,
  };

  return tx_info;
}

export async function mapAccountTxData({
  walletAddress,
  data,
}: MapTransactionListProps) {
  const mappedData = data?.reverse().map((tx: any, index: number) => {
    const input_utxo = tx.inputs.map((utxo: any) => {
      const lovelace =
        utxo.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0';

      const mappedAssetList = utxo.amount
        .filter((asset: any) => asset.unit !== 'lovelace')
        .map((asset: any) => {
          const policyId = asset.unit.substring(0, 56);
          const name = asset.unit.substring(56);
          return {
            asset_name: hexToText(name),
            fingerprint: asset.unit, // Asumo que no hay fingerprint en la nueva estructura
            policy_id: policyId, // Asumo que no hay policy_id en la nueva estructura
            quantity: parseInt(asset.quantity),
          };
        });

      const isOwnerAddress = walletAddress === utxo.address ? true : false;

      return {
        tx_index: utxo.output_index,
        tx_hash: utxo.tx_hash,
        address: utxo.address,
        isOwnerAddress: isOwnerAddress,
        asset_list: mappedAssetList,
        lovelace: parseInt(lovelace),
        formatedADAValue: getNumberParts(lovelaceToAda(parseInt(lovelace))),
      };
    });

    const output_utxo = tx.outputs.map((utxo: any) => {
      const lovelace =
        utxo.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0';

      const mappedAssetList = utxo.amount
        .filter((asset: any) => asset.unit !== 'lovelace')
        .map((asset: any) => {
          const policyId = asset.unit.substring(0, 56);
          const name = asset.unit.substring(56);

          return {
            asset_name: hexToText(name),
            fingerprint: asset.unit, // Asumo que no hay fingerprint en la nueva estructura
            policy_id: policyId, // Asumo que no hay policy_id en la nueva estructura
            quantity: parseInt(asset.quantity),
          };
        });

      const isOwnerAddress = walletAddress === utxo.address ? true : false;
      return {
        tx_index: utxo.output_index,
        tx_hash: '', // No hay tx_hash en la salida de la nueva estructura
        address: utxo.address,
        isOwnerAddress: isOwnerAddress,
        asset_list: mappedAssetList,
        lovelace: parseInt(lovelace),
        formatedADAValue: getNumberParts(lovelaceToAda(parseInt(lovelace))),
      };
    });

    const input_utxo_value: {
      value: number;
      totalInputAssets: any;
      totalAssetQuantity: number;
    } = input_utxo.reduce(
      (acumulador: any, utxo: any) => {
        if (utxo.address === walletAddress) {
          const totalAssetQuantity = utxo.asset_list.reduce(
            (sum: any, asset: any) => sum + parseInt(asset.quantity),
            acumulador.totalAssetQuantity
          );
          const totalInputAssets = utxo.asset_list.reduce(
            (acc: any, asset: any) => {
              if (!acc[asset.asset_name]) {
                acc[asset.asset_name] = 0;
              }
              acc[asset.asset_name] =
                acc[asset.asset_name] + parseInt(asset.quantity);
              return acc;
            },
            { ...acumulador.totalInputAssets }
          );
          return {
            value: acumulador.value + parseInt(utxo.lovelace),
            totalInputAssets: totalInputAssets,
            totalAssetQuantity: totalAssetQuantity,
          };
        }
        return acumulador;
      },
      { value: 0, totalAssetQuantity: 0, totalInputAssets: {} }
    );

    const output_utxo_value: {
      value: number;
      totalAssetQuantity: number;
      totalOutputAssets: any;
    } = output_utxo.reduce(
      (acumulador: any, utxo: any) => {
        if (utxo.address === walletAddress) {
          const totalAssetQuantity = utxo.asset_list.reduce(
            (sum: any, asset: any) => sum + parseInt(asset.quantity),
            acumulador.totalAssetQuantity
          );
          const totalOutputAssets = utxo.asset_list.reduce(
            (acc: any, asset: any) => {
              if (!acc[asset.asset_name]) {
                acc[asset.asset_name] = 0;
              }
              acc[asset.asset_name] =
                acc[asset.asset_name] + parseInt(asset.quantity);
              return acc;
            },
            { ...acumulador.totalOutputAssets }
          );
          return {
            value: acumulador.value + parseInt(utxo.lovelace),
            totalOutputAssets: totalOutputAssets,
            totalAssetQuantity: totalAssetQuantity,
          };
        }
        return acumulador;
      },
      { value: 0, totalAssetQuantity: 0, totalOutputAssets: {} }
    );

    const tx_value = lovelaceToAda(
      output_utxo_value.value - input_utxo_value.value
    );
    const tx_fee = lovelaceToAda(tx.fees);
    const tx_size = tx.size;

    let tx_type;
    let title = '';
    let subtitle = getDateFromTimeStamp(tx.block_time);
    if (tx_value >= 0) {
      title = 'Fondos Recibidos';
      tx_type = TRANSACTION_TYPES.RECEIVED;
    } else {
      title = 'Fondos Enviados';
      tx_type = TRANSACTION_TYPES.SENT;
    }

    if (
      input_utxo_value.totalAssetQuantity > output_utxo_value.totalAssetQuantity
    ) {
      title = title + ', Tokens Enviados';
    } else if (
      input_utxo_value.totalAssetQuantity < output_utxo_value.totalAssetQuantity
    ) {
      title = title + ', Tokens Recibidos';
    }

    const tx_assets = assetDifference(
      input_utxo_value.totalInputAssets,
      output_utxo_value.totalOutputAssets,
      tx_type
    );
    const tx_assets_mapped = Object.entries(tx_assets).map(
      ([clave, valor]: any) => {
        return {
          name: clave,
          quantity: valor,
        };
      }
    );

    const tx_info: MappedTransactionInfoProps = {
      tx_type: tx_type,
      title: title,
      subtitle: subtitle,
      tx_id: tx.hash,
      block: tx.block_height,
      tx_size: tx_size,
      tx_value: formatADAsToString(tx_value),
      tx_fee: formatADAsToString(-Math.abs(tx_fee)),
      tx_assets: tx_assets_mapped,
      inputUTxOs: input_utxo,
      outputUTxOs: output_utxo,
      tx_time_live: getTimeLive(tx.block_time),
      metadata: tx.metadata, // No hay metadata en la nueva estructura
    };
    return tx_info;
  });

  if (!mappedData) {
    return [];
  }

  return mappedData.reverse();
}

export async function mapTransactionListInfo({
  walletAddress,
  data,
}: MapTransactionListProps) {
  const mappedData = data?.reverse().map((tx: any, index: number) => {
    const input_utxo = tx.inputs.map((utxo: any) => {
      const mappedAssetList = utxo.asset_list.map((asset: any) => {
        return {
          asset_name: hexToText(asset.asset_name),
          fingerprint: asset.fingerprint,
          policy_id: asset.policy_id,
          quantity: parseInt(asset.quantity),
        };
      });
      const isOwnerAddress =
        walletAddress === utxo.payment_addr.bech32 ? true : false;
      return {
        tx_index: utxo.tx_index,
        tx_hash: utxo.tx_hash,
        address: utxo.payment_addr.bech32,
        isOwnerAddress: isOwnerAddress,
        asset_list: mappedAssetList,
        lovelace: parseInt(utxo.value),
        formatedADAValue: getNumberParts(lovelaceToAda(parseInt(utxo.value))),
      };
    });

    const output_utxo = tx.outputs.map((utxo: any) => {
      const mappedAssetList = utxo.asset_list.map((asset: any) => {
        return {
          asset_name: hexToText(asset.asset_name),
          fingerprint: asset.fingerprint,
          policy_id: asset.policy_id,
          quantity: parseInt(asset.quantity),
        };
      });
      const isOwnerAddress =
        walletAddress === utxo.payment_addr.bech32 ? true : false;
      return {
        tx_index: utxo.tx_index,
        tx_hash: utxo.tx_hash,
        address: utxo.payment_addr.bech32,
        isOwnerAddress: isOwnerAddress,
        asset_list: mappedAssetList,
        lovelace: parseInt(utxo.value),
        formatedADAValue: getNumberParts(lovelaceToAda(parseInt(utxo.value))),
      };
    });

    // Calcular movimiento de saldo relacionado al address

    const input_utxo_value: {
      value: number;
      totalInputAssets: any;
      totalAssetQuantity: number;
    } = input_utxo.reduce(
      (acumulador: any, utxo: any) => {
        if (utxo.address === walletAddress) {
          const totalAssetQuantity = utxo.asset_list.reduce(
            (sum: any, asset: any) => sum + parseInt(asset.quantity),
            acumulador.totalAssetQuantity
          );
          const totalInputAssets = utxo.asset_list.reduce(
            (acc: any, asset: any) => {
              if (!acc[asset.asset_name]) {
                acc[asset.asset_name] = 0;
              }
              acc[asset.asset_name] =
                acc[asset.asset_name] + parseInt(asset.quantity);
              return acc;
            },
            { ...acumulador.totalInputAssets }
          );
          return {
            value: acumulador.value + parseInt(utxo.lovelace),
            totalInputAssets: totalInputAssets,
            totalAssetQuantity: totalAssetQuantity,
          };
        }
        return acumulador;
      },
      { value: 0, totalAssetQuantity: 0, totalInputAssets: {} }
    );

    const output_utxo_value: {
      value: number;
      totalAssetQuantity: number;
      totalOutputAssets: any;
    } = output_utxo.reduce(
      (acumulador: any, utxo: any) => {
        if (utxo.address === walletAddress) {
          const totalAssetQuantity = utxo.asset_list.reduce(
            (sum: any, asset: any) => sum + parseInt(asset.quantity),
            acumulador.totalAssetQuantity
          );
          const totalOutputAssets = utxo.asset_list.reduce(
            (acc: any, asset: any) => {
              if (!acc[asset.asset_name]) {
                acc[asset.asset_name] = 0;
              }
              acc[asset.asset_name] =
                acc[asset.asset_name] + parseInt(asset.quantity);
              return acc;
            },
            { ...acumulador.totalOutputAssets }
          );
          return {
            value: acumulador.value + parseInt(utxo.lovelace),
            totalOutputAssets: totalOutputAssets,
            totalAssetQuantity: totalAssetQuantity,
          };
        }
        return acumulador;
      },
      { value: 0, totalAssetQuantity: 0, totalOutputAssets: {} }
    );

    const tx_value = lovelaceToAda(
      output_utxo_value.value - input_utxo_value.value
    );
    const tx_fee = lovelaceToAda(tx.fee);

    let tx_type;
    let title = '';
    let subtitle = getDateFromTimeStamp(tx.tx_timestamp);
    if (tx_value >= 0) {
      title = 'Fondos Recibidos';
      tx_type = TRANSACTION_TYPES.RECEIVED;
    } else {
      title = 'Fondos Enviados';
      tx_type = TRANSACTION_TYPES.SENT;
    }

    if (
      input_utxo_value.totalAssetQuantity > output_utxo_value.totalAssetQuantity
    ) {
      title = title + ', Tokens Enviados';
    } else if (
      input_utxo_value.totalAssetQuantity < output_utxo_value.totalAssetQuantity
    ) {
      title = title + ', Tokens Recibidos';
    }

    const tx_assets = assetDifference(
      input_utxo_value.totalInputAssets,
      output_utxo_value.totalOutputAssets,
      tx_type
    );
    const tx_assets_mapped = Object.entries(tx_assets).map(
      ([clave, valor]: any) => {
        return {
          name: clave,
          quantity: valor,
        };
      }
    );

    const tx_info: MappedTransactionInfoProps = {
      tx_type: tx_type,
      title: title,
      subtitle: subtitle,
      tx_id: tx.tx_hash,
      block: tx.block_height,
      tx_size: tx.tx_size,
      tx_value: formatADAsToString(tx_value),
      tx_fee: formatADAsToString(-Math.abs(tx_fee)),
      tx_assets: tx_assets_mapped,
      inputUTxOs: input_utxo,
      outputUTxOs: output_utxo,
      tx_time_live: getTimeLive(tx.tx_timestamp),
      metadata: tx.metadata ? tx.metadata : [],
    };
    return tx_info;
  });

  if (!mappedData) {
    return [];
  }

  return mappedData.reverse();
}
