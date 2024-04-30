import { updateProduct } from '@marketplaces/data-access';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const payload = req.body;
      const updatedProductResponse = await updateProduct(payload);

      res.status(200).json(updatedProductResponse);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred updating product:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
