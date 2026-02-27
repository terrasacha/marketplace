export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { walletId } = req.query;
    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE || 'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

    const response = await fetch(`${WALLET_API_BASE}/wallets/${walletId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy de bloquear billetera:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
  }
}

