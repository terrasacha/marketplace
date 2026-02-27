export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener policyId desde path parameter (en Next.js se accede desde req.query)
    const { policyId } = req.query;
    // Obtener page y limit desde query parameters
    let { page = 1, limit = 10 } = req.query;
    
    // Convertir a números y validar
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    // Validar límite máximo (el API externo solo permite máximo 20)
    if (limit > 20) {
      return res.status(422).json({
        success: false,
        error: 'Límite excede el máximo permitido',
        details: [
          {
            code: 'invalid_limit',
            message: 'El parámetro limit debe ser menor o igual a 20',
            field: 'query.limit',
          },
        ],
      });
    }
    
    // Validar límite mínimo
    if (limit < 1) {
      limit = 1;
    }
    
    // Validar página mínima
    if (page < 1) {
      page = 1;
    }

    // Validar que policyId esté presente
    if (!policyId) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido faltante',
        details: [
          {
            code: 'missing_parameter',
            message: 'policyId es un parámetro requerido',
            field: 'path',
          },
        ],
      });
    }

    // Validar formato de policyId (56 caracteres hex)
    if (policyId.length !== 56 || !/^[0-9a-fA-F]+$/.test(policyId)) {
      return res.status(422).json({
        success: false,
        error: 'Formato de policy_id inválido',
        details: [
          {
            code: 'invalid_format',
            message: 'policy_id debe tener exactamente 56 caracteres hexadecimales',
            field: 'path.policyId',
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
    // Según documentación: "Authentication required" (401)
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

    // Construir URL con path parameter (policyId) y query parameters (page, limit)
    let url = `${WALLET_API_BASE}/assets/policy/${policyId}/details`;
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    url += `?${queryParams.toString()}`;

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
    res.status(response.status).json(data);
  } catch (error) {
    // Solo manejar errores de red/proxy mismo, no normalizar
    console.error('Error en proxy de detalles de assets por policy:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de detalles de assets',
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
