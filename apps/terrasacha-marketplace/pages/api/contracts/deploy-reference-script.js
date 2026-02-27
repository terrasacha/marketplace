export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = req.body || {};
    const { destination_address, policy_id } = body;

    if (
      !destination_address ||
      typeof destination_address !== 'string' ||
      !destination_address.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido faltante',
        details: [
          {
            code: 'missing_parameter',
            message: 'destination_address es un parámetro requerido',
            field: 'body',
          },
        ],
      });
    }

    if (!policy_id || typeof policy_id !== 'string' || !policy_id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido faltante',
        details: [
          {
            code: 'missing_parameter',
            message: 'policy_id es un parámetro requerido',
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

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autorización',
        details: [
          {
            code: 'missing_auth',
            message:
              'Se requiere el header Authorization con el token de acceso',
            field: 'headers',
          },
        ],
      });
    }

    const url = `${WALLET_API_BASE}/contracts/deploy-reference-script`;
    const payload = {
      destination_address: destination_address.trim(),
      policy_id: policy_id.trim(),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
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
    console.error('Error en proxy de deploy-reference-script:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar el despliegue del reference script',
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

