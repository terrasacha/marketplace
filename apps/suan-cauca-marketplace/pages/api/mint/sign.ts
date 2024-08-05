import type { NextApiRequest, NextApiResponse } from "next";
/* import { AppWallet, BlockfrostProvider, Transaction } from "@meshsdk/core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const signedTx = req.body.signedTx;
    const originalMetadata = req.body.originalMetadata;

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

    try {
      const blockfrostProvider = new BlockfrostProvider(blockFrostKeysPreview);

      const tokenWallet = new AppWallet({
        networkId: 0,
        fetcher: blockfrostProvider,
        submitter: blockfrostProvider,
        key: {
          type: "mnemonic",
          words: tokenNmemonic,
        },
      });

      const signedOrigialTx = Transaction.writeMetadata(
        signedTx,
        originalMetadata
      );

      const appWalletSignedTx = await tokenWallet.signTx(signedOrigialTx, true);

      res.status(200).json({ appWalletSignedTx });
    } catch (error) {
      res.status(500).json({
        message: `Failed to internally sign the transaction. Error: ${error}`,
      });
    }
  }
}
 */