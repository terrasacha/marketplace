/* import { NextApiRequest, NextApiResponse } from 'next';

import {
  BlockfrostProvider,
  UTxO,
  AppWallet,
  largestFirst,
  ForgeScript,
  Mint,
  AssetMetadata,
  Transaction,
  resolveNativeScriptHash,
  resolvePaymentKeyHash,
} from '@meshsdk/core';
import type { NativeScript } from '@meshsdk/core';

import { bankWalletAddress } from '@cauca//backend/mint';

const validateMinimumAdaValue = async (
  recipientAddress: string,
  policyID: string,
  tokenName: string,
  tokenAmount: number
) => {
  // Validación ADA minimo
  const payload = {
    addressDestin: {
      address: recipientAddress,
      lovelace: 0,
      multiAsset: [
        {
          policyid: policyID,
          tokens: {
            [tokenName]: tokenAmount,
          },
        },
      ],
    }
  };
  console.log(payload);

  const url =
    `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/helpers/min-lovelace/`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
      },
      body: JSON.stringify(payload),
    });
    const minLovelaceValue = await response.json();
    console.log('Valor minimo de lovelace: ', minLovelaceValue);
    return minLovelaceValue;
  } catch (error) {
    return false;
  }
};

const getFeeAmount = async (txcbor: string) => {
  const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/helpers/tx-fee/?txcbor=${txcbor}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
      },
    });
    const feeAmount = await response.json();

    return feeAmount;
  } catch (error) {
    return false;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    let blockFrostKeysPreview: string;
    if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
      blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
    } else {
      throw new Error(
        `Parameter ${process.env['blockFrostKeysPreview']} not found`
      );
    }
    let tokenNmemonic: string[];
    if (process.env.secrets) {
      tokenNmemonic = JSON.parse(process.env.secrets).TOKEN_NMEMONIC.split(',');
    } else {
      if (process.env.NEXT_PUBLIC_TOKEN_NMEMONIC) {
        tokenNmemonic = process.env.NEXT_PUBLIC_TOKEN_NMEMONIC.split(',');
      } else {
        throw new Error(`Parameter ${process.env['tokenNmemonic']} not found`);
      }
    }

    const blockfrostProvider = new BlockfrostProvider(blockFrostKeysPreview);
    const recipientAddress: string = req.body.recipientAddress;
    const quantity: number = req.body.quantity;
    const utxos: UTxO[] = req.body.utxos;
    const assetMetadata: AssetMetadata = req.body.assetMetadata;
    const price: number = req.body.price;
    const assetName = assetMetadata.token_name;

    try {
      const appWallet = new AppWallet({
        networkId: 0,
        fetcher: blockfrostProvider,
        submitter: blockfrostProvider,
        key: {
          type: 'mnemonic',
          words: tokenNmemonic,
        },
      });
      const appWalletAddress = appWallet.getPaymentAddress();

      const costLovelace = price * quantity;

      const simpleScriptPolicyID =
        ForgeScript.withOneSignature(appWalletAddress);

      const keyHash = resolvePaymentKeyHash(appWalletAddress);

      const nativeScript: NativeScript = {
        type: 'sig',
        keyHash: keyHash,
      };

      const policyId = resolveNativeScriptHash(nativeScript);

      const minAdaValue = await validateMinimumAdaValue(
        recipientAddress,
        policyId,
        assetMetadata.token_name,
        quantity
      );
      const finalCost =
        costLovelace > minAdaValue
          ? costLovelace.toString()
          : minAdaValue.toString();
      console.log(minAdaValue);
      const asset: Mint = {
        assetName: assetName,
        assetQuantity: quantity.toString(),
        metadata: assetMetadata,
        label: '721',
        recipient: {
          address: recipientAddress,
        },
      };

      const tx = new Transaction({ initiator: appWallet });

      const selectedUtxos = largestFirst(finalCost, utxos, true);

      tx.setTxInputs(selectedUtxos);
      tx.mintAsset(simpleScriptPolicyID, asset);
      tx.sendLovelace(bankWalletAddress, finalCost);
      tx.setChangeAddress(recipientAddress);
      const unsignedTx = await tx.build();
      const feeAmount = await getFeeAmount(unsignedTx);
      const originalMetadata = Transaction.readMetadata(unsignedTx);
      const maskedTx = Transaction.maskMetadata(unsignedTx);
      res.status(200).json({
        status: true,
        maskedTx,
        originalMetadata,
        simpleScriptPolicyID,
        costLovelace: finalCost,
        feeAmount,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to build the transaction. Error: ${error}` });
    }
  }

  if (req.method === 'GET') {
    res.status(200).json({ message: 'This is response of the api' });
  }
}
 */