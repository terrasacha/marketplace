import { getPendingTokensForClaiming } from '@marketplaces/data-access';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const payload = JSON.parse(req.body);
      const getPendingTokensResponse = await getPendingTokensForClaiming(
        payload.userId
      );

      res.status(200).json(getPendingTokensResponse);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred updating order:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
