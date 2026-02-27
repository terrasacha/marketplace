import { checkAndCreateWalletOnDB } from '@marketplaces/data-access';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE || 'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

    const { userId, ...walletPayload } = req.body;

    const response = await fetch(`${WALLET_API_BASE}/wallets/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
      },
      body: JSON.stringify(walletPayload),
    });

    const data = await response.json();

    if (data.success && data.wallet_id && userId) {
      try {
        await checkAndCreateWalletOnDB(data, userId);
        console.log(`Wallet ${data.wallet_id} vinculada con usuario ${userId}`);
      } catch (dbError) {
        console.error('Error al vincular wallet con usuario en DB:', dbError);
      }
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy de crear billetera:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
  }
}

