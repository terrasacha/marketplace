export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud
      const url =
        'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/transactions/confirm-submit/';

      const queryParams = new URLSearchParams(payload);

      const urlWithParams = `${url}?${queryParams.toString()}`;

      const response = await fetch(urlWithParams, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
        // body: JSON.stringify(payload),
      });

      const signSubmitResponse = await response.json();

      res.status(200).json({ txSubmit: signSubmitResponse });
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
