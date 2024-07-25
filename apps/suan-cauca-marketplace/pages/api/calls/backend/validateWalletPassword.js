import { validatePassword } from '@marketplaces/data-access';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { password, wallet_id } = req.body;

      const isValidUser = await validatePassword(password, wallet_id);

      res.status(200).json({ isValidUser });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Error al procesar la solicitud: ' + error });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
