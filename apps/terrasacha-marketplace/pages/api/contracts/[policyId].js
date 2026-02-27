export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener policy_id SIEMPRE desde el parámetro de ruta
    const policyId = req.query.policyId;

    // Validar que policy_id esté presente
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

    // Construir URL del endpoint externo
    const url = `${WALLET_API_BASE}/contracts/${policyId}`;

    const upstreamMethod = req.method === 'DELETE' ? 'DELETE' : 'GET';
    const response = await fetch(url, {
      method: upstreamMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        'Authorization': authHeader,
      },
    });

    // DELETE puede responder sin body (204). Leer de forma segura.
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    // Reenviar la respuesta del API externo tal cual (con su status code)
    res.status(response.status).json(data);
  } catch (error) {
    // Solo manejar errores de red/proxy mismo, no normalizar
    console.error('Error en proxy de información de contrato:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de información de contrato',
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
