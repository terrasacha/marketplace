export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const url =
        `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/query-address/?address=${payload}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        }
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
