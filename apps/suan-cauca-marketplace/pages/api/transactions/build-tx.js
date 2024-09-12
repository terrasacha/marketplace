import { createTransaction } from "@marketplaces/data-access";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud
      const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/transactions/build-tx/`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
        body: JSON.stringify(payload.payload),
      });

      const data = await response.json();

      if (data?.success) {
        const newTransactionPayload = {
          addressOrigin: payload.transactionPayload.walletAddress,
          addressDestination: JSON.stringify(payload.payload.addresses),
          walletID: payload.transactionPayload.walletID,
          txIn: JSON.stringify(data.build_tx.inputs),
          txOutput: JSON.stringify(data.build_tx.outputs),
          txCborhex: data.cbor,
          txHash: data.build_tx.tx_id,
          mint: JSON.stringify(data.build_tx.mint),
          scriptDataHash: data.build_tx.script_data_hash,
          metadataUrl: data.metadata_cbor,
          fees: data.build_tx.fee,
          network: 'testnet',
          type: 'sendTransaction',
          productID: null,
          signed: false,
        };
        console.log(newTransactionPayload)

        const newTransaction = await createTransaction(newTransactionPayload);

        res.status(200).json({ ...data, transaction_id: newTransaction.id });
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
