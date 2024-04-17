const SUBMIT_TX_URL =
  'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/transactions/sign-submit/';

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
      const { wallet_id, cbor, metadata } = req.body;

      const submitTx = {
        wallet_id,
        cbor,
        metadata,
      };

      const response = await submitTransaction(submitTx);
      const signSubmitResponse = await response.json();

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
