import { createToken } from '@marketplaces/data-access';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const payload = req.body;
      const createdTokenResponse = await createToken(payload);

      res.status(200).json(createdTokenResponse);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred creating Token:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
