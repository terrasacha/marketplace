export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Leer parámetros opcionales de query (GET) o body (POST)
    const tx_type = req.method === 'GET' ? req.query.tx_type : req.body?.tx_type;
    const status = req.method === 'GET' ? req.query.status : req.body?.status;
    const limit = req.method === 'GET' ? req.query.limit : req.body?.limit;
    const offset = req.method === 'GET' ? req.query.offset : req.body?.offset;

    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE ||
      'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

    // Obtener Authorization header del request
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autorización',
        details: [
          {
            code: 'missing_auth',
            message: 'Se requiere el header Authorization con el token de acceso',
            field: 'headers',
          },
        ],
      });
    }

    // Construir URL con query parameters
    let url = `${WALLET_API_BASE}/transactions/history`;
    const queryParams = new URLSearchParams();
    if (tx_type !== undefined && tx_type !== null) {
      queryParams.append('tx_type', tx_type.toString());
    }
    if (status !== undefined && status !== null) {
      queryParams.append('status', status.toString());
    }
    if (limit !== undefined && limit !== null) {
      queryParams.append('limit', limit.toString());
    }
    if (offset !== undefined && offset !== null) {
      queryParams.append('offset', offset.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    // Reenviar la respuesta del API externo tal cual (con su status code)
    // El manejo de errores se hace en walletApi.ts
    res.status(response.status).json(data);
  } catch (error) {
    // Solo manejar errores de red/proxy mismo, no normalizar
    console.error('Error en proxy de history de transacciones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de historial de transacciones',
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
