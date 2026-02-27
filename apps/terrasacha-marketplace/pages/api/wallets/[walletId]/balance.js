export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { walletId } = req.query;
    // Para GET, leer parámetros de query string; para POST, del body
    const limit_addresses = req.method === 'GET' 
      ? req.query.limit_addresses 
      : req.body?.limit_addresses;

    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE ||
      'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

    // Obtener Authorization header del request
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Construir URL con query parameters
    let url = `${WALLET_API_BASE}/wallets/${walletId}/balance`;
    const queryParams = new URLSearchParams();
    if (limit_addresses !== undefined && limit_addresses !== null) {
      queryParams.append('limit_addresses', limit_addresses.toString());
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
    console.error('Error en proxy de balance de billetera:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de balance',
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


