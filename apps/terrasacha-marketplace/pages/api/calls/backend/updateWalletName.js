import { getWalletByUser, updateWallet } from '@marketplaces/data-access';

/**
 * Actualiza el campo name de la wallet en DynamoDB (plataforma).
 * POST body: { wallet_id, new_name, password, user_id }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { wallet_id, new_name, password, user_id } = body;

    if (!wallet_id || !new_name || !password || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros: wallet_id, new_name, password y user_id son requeridos',
      });
    }

    const wallets = await getWalletByUser(user_id);
    const list = Array.isArray(wallets) ? wallets : [];
    const wallet = list.find((w) => w.id === wallet_id || w.wallet_id === wallet_id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet no encontrada para este usuario',
      });
    }

    const isAdmin = wallet.isAdmin === true;
    await updateWallet({
      id: wallet_id,
      name: String(new_name).trim(),
      passphrase: password,
      claimed_token: wallet.claimed_token ?? false,
      isAdmin,
    });

    return res.status(200).json({ success: true, message: 'Nombre actualizado en la plataforma' });
  } catch (error) {
    console.error('Error en updateWalletName:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error al actualizar el nombre de la wallet',
    });
  }
}
