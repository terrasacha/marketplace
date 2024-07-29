import { updateTransaction } from '@marketplaces/data-access';

const SUBMIT_TX_URL = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/transactions/sign-submit/`;

async function submitTransaction(submitTx) {
  return await fetch(SUBMIT_TX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
    },
    body: JSON.stringify(submitTx),
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        wallet_id,
        cbor,
        scriptIds,
        redeemers_cbor,
        metadata_cbor,
        transaction_id = null,
      } = req.body;

      const submitTx = {
        wallet_id,
        scriptIds,
        cbor,
        redeemers_cbor,
        metadata_cbor,
      };

      const response = await submitTransaction(submitTx);
      const signSubmitResponse = await response.json();

      // Actualizar transaccion
      if (signSubmitResponse?.success && transaction_id) {
        await updateTransaction({ id: transaction_id, signed: true });
      }

      res.status(200).json({ txSubmit: signSubmitResponse });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Error al procesar la solicitud: ' + error });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
