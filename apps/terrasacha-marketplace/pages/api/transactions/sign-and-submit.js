export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { password, transaction_id } = req.body;

    // Validar campos requeridos
    if (password === undefined || transaction_id === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        details: [
          {
            code: 'missing_fields',
            message: 'password y transaction_id son campos requeridos',
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

    // Construir el body para el API externo
    const requestBody = {
      password,
      transaction_id,
    };

    const response = await fetch(`${WALLET_API_BASE}/transactions/sign-and-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Reenviar la respuesta del API externo tal cual (con su status code)
    // El manejo de errores se hace en walletApi.ts
    res.status(response.status).json(data);
  } catch (error) {
    // Solo manejar errores de red/proxy mismo, no normalizar
    console.error('Error en proxy de sign-and-submit de transacción:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de firma y envío de transacción',
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
