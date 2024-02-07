import { validatePassword } from '@marketplaces/data-access';

const SUBMIT_TX_URL =
  'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/transactions/sign-submit/';

async function submitTransaction(submitTx) {
  return await fetch(SUBMIT_TX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY_ENDPOINT || '',
    },
    body: JSON.stringify(submitTx),
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { password, wallet_id, cbor } = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud

      const isValidUser = await validatePassword(password, wallet_id);

      if (isValidUser) {
        const submitTx = { wallet_id, cbor };
        const response = await submitTransaction(submitTx);
        const signSubmitResponse = await response.json();
      
        const data = {
          isValidUser,
          txSubmit: signSubmitResponse,
        };
      
        res.status(200).json(data);
      } else {
        res.status(200).json({ isValidUser });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Error al procesar la solicitud: ' + error });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
