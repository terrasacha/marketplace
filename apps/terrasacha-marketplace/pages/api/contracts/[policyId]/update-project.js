export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const policyId = req.query.policyId;
    if (!policyId) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido faltante',
        details: [
          {
            code: 'missing_parameter',
            message: 'policy_id es un parámetro requerido',
            field: 'query',
          },
        ],
      });
    }

    const WALLET_API_ROOT =
      process.env.NEXT_PUBLIC_WALLET_API_BASE ||
      'https://i7smbwdmuf.us-east-2.awsapprunner.com';
    const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
    const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

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

    const url = `${WALLET_API_BASE}/contracts/${policyId}/update-project`;
    const body = req.body || {};

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en proxy de update-project:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de update-project',
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

