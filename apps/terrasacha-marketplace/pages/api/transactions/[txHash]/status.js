/**
 * Proxy a GET /api/v1/transactions/{tx_hash}/status (Wallet API).
 * Respuesta exitosa: { tx_hash, status, confirmations, block_height, block_time, fee_lovelace, explorer_url, submitted_at, confirmed_at }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { txHash } = req.query;

    if (!txHash || typeof txHash !== 'string' || !txHash.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro tx_hash requerido',
        details: [{ code: 'missing_parameter', message: 'tx_hash es requerido', field: 'query' }],
      });
    }

    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE ||
      'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

    const url = `${WALLET_API_BASE}/transactions/${encodeURIComponent(txHash.trim())}/status`;
    const headers = {
      'Content-Type': 'application/json',
      ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
    };
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json().catch(() => ({}));

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy de status de transacción:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al consultar el estado de la transacción',
      details: [{ code: 'proxy_error', message: error.message || 'Error de conexión', field: 'proxy' }],
    });
  }
}
