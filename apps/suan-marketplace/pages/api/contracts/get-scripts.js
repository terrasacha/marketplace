export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const url =
        'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/contracts/get-scripts/';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
