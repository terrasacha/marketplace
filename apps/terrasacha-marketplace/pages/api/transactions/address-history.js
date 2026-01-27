export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Leer parámetros del body
    const { address, from_block, to_block, page, limit } = req.body || {};

    // Validar que address esté presente (parámetro requerido)
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido faltante',
        details: [
          {
            code: 'missing_parameter',
            message: 'address es un parámetro requerido',
            field: 'body',
          },
        ],
      });
    }

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
    let url = `${WALLET_API_BASE}/transactions/address-history/`;
    const queryParams = new URLSearchParams();
    queryParams.append('address', address.toString());
    
    if (from_block !== undefined && from_block !== null) {
      queryParams.append('from_block', from_block.toString());
    }
    if (to_block !== undefined && to_block !== null) {
      queryParams.append('to_block', to_block.toString());
    }
    if (page !== undefined && page !== null) {
      queryParams.append('page', page.toString());
    }
    if (limit !== undefined && limit !== null) {
      queryParams.append('limit', limit.toString());
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
    console.error('Error en proxy de address-history de transacciones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de historial de transacciones por dirección',
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
