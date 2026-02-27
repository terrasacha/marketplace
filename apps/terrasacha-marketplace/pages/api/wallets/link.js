import { checkAndCreateWalletOnDB } from '@marketplaces/data-access';

/**
 * Vincula una billetera ya creada (ej. por import) al usuario en la base de datos.
 * POST body: { userId, wallet_id, name, enterprise_address?, staking_address? }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, wallet_id, name, enterprise_address, staking_address } = req.body || {};

    if (!userId || !wallet_id) {
      return res.status(400).json({
        success: false,
        error: 'Faltan userId o wallet_id',
      });
    }

    const walletData = {
      wallet_id,
      name: name || wallet_id,
      enterprise_address: enterprise_address || '',
      staking_address: staking_address || '',
    };

    await checkAndCreateWalletOnDB(walletData, userId);
    return res.status(200).json({ success: true, message: 'Billetera vinculada al usuario' });
  } catch (error) {
    console.error('Error al vincular billetera:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error al vincular la billetera',
    });
  }
}
