export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud

      const action = payload.action;
      const master_wallet_id = payload.master_wallet_id;
      const oracle_wallet_name = payload.oracle_wallet_name;

      const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/transactions/oracle-datum/${action}?master_wallet_id=${master_wallet_id}&oracle_wallet_name=${oracle_wallet_name}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
        body: JSON.stringify(payload.payload),
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
