import { NextApiRequest, NextApiResponse } from "next";

import {
  BlockfrostProvider,
  UTxO,
  AppWallet,
  largestFirst,
  ForgeScript,
  Mint,
  AssetMetadata,
  Transaction,
} from "@meshsdk/core";

import { bankWalletAddress } from "@suan//backend/mint";
/* import { integer } from "aws-sdk/clients/cloudfront"; */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    let blockFrostKeysPreview: string;
    if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
      blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
    } else {
      throw new Error(
        `Parameter ${process.env["blockFrostKeysPreview"]} not found`
      );
    }
    let tokenNmemonic: string[]
    if(process.env.secrets){
      tokenNmemonic = JSON.parse(process.env.secrets).TOKEN_NMEMONIC.split(",")
    }else{
      if (process.env.NEXT_PUBLIC_TOKEN_NMEMONIC) {
        tokenNmemonic = process.env.NEXT_PUBLIC_TOKEN_NMEMONIC.split(",");
      } else {
        throw new Error(`Parameter ${process.env["tokenNmemonic"]} not found`);
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
          type: "mnemonic",
          words: tokenNmemonic,
        },
      });
      const appWalletAddress = appWallet.getPaymentAddress();

      const costLovelace = price * quantity * 1000000;

      const selectedUtxos = largestFirst(costLovelace.toString(), utxos, true);

      const simpleScriptPolicyID =
        ForgeScript.withOneSignature(appWalletAddress);

      const asset: Mint = {
        assetName: assetName,
        assetQuantity: quantity.toString(),
        metadata: assetMetadata,
        label: "721",
        recipient: {
          address: recipientAddress,
        },
      };

      const tx = new Transaction({ initiator: appWallet });
      tx.setTxInputs(selectedUtxos);
      tx.mintAsset(simpleScriptPolicyID, asset);
      tx.sendLovelace(bankWalletAddress, costLovelace.toString());
      tx.setChangeAddress(recipientAddress);
      const unsignedTx = await tx.build();
      const originalMetadata = Transaction.readMetadata(unsignedTx);
      const maskedTx = Transaction.maskMetadata(unsignedTx);
      res.status(200).json({ maskedTx, originalMetadata, simpleScriptPolicyID });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to build the transaction. Error: ${error}` });
    }
  }

  if (req.method === "GET") {
    res.status(200).json({ message: "This is response of the api" });
  }
}
