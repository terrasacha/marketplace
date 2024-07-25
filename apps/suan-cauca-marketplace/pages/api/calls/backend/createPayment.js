import { createPayment } from '@marketplaces/data-access';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const payload = req.body;
      const updatedOrderResponse = await createPayment(payload);

      res.status(200).json(updatedOrderResponse);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred updating order:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
