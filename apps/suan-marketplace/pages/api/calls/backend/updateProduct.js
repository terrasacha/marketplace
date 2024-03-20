import { updateProduct } from '@marketplaces/data-access';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const payload = req.body;
    await updateProduct(payload);
    res.status(200);
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
