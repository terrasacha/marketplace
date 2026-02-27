export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Leer parámetros del body
    const { contract_name, contract_type } = req.body || {};

    // Validaciones básicas
    if (!contract_name || !contract_type) {
      const missing = [];
      if (!contract_name) missing.push('contract_name');
      if (!contract_type) missing.push('contract_type');

      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido faltante',
        details: missing.map((field) => ({
          code: 'missing_parameter',
          message: `${field} es un parámetro requerido`,
          field: 'body',
        })),
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

    const url = `${WALLET_API_BASE}/contracts/compile`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        'Authorization': authHeader,
      },
      body: JSON.stringify({ contract_name, contract_type }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy de compile de contratos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de compilación de contrato',
      details: [
        {
          code: 'proxy_error',
          message:
            error.message || 'Error al conectar con el servidor de billeteras',
          field: 'proxy',
        },
      ],
    });
  }
}

