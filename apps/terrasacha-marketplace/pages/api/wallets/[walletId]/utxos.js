export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { walletId } = req.query;
    const { address_index, min_ada } = req.body || {};

    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE ||
      'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

    // Obtener Authorization header del request
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Construir URL con query parameters (los parámetros opcionales vienen del body)
    let url = `${WALLET_API_BASE}/wallets/${walletId}/utxos`;
    const queryParams = new URLSearchParams();
    if (address_index !== undefined) {
      queryParams.append('address_index', address_index.toString());
    }
    if (min_ada !== undefined) {
      queryParams.append('min_ada', min_ada.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    
    // Reenviar la respuesta del API externo tal cual (con su status code)
    // El manejo de errores se hace en walletApi.ts
    res.status(response.status).json(data);
  } catch (error) {
    // Solo manejar errores de red/proxy mismo, no normalizar
    console.error('Error en proxy de UTXOs de billetera:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de UTXOs',
      details: [
        {
          code: 'proxy_error',
          message: error.message || 'Error al conectar con el servidor de billeteras',
          field: 'proxy',
        },
      ],
    });
  }
}

