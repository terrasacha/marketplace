export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { amount_ada, from_address_index, metadata, to_address, assets } = req.body;

    // Validar campos requeridos
    if (amount_ada === undefined || to_address === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        details: [
          {
            code: 'missing_fields',
            message: 'amount_ada y to_address son campos requeridos',
            field: 'body',
          },
        ],
      });
    }

    // Validar estructura de assets si se proporcionan
    if (assets !== undefined) {
      if (!Array.isArray(assets)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de assets inválido',
          details: [
            {
              code: 'invalid_format',
              message: 'assets debe ser un array',
              field: 'body.assets',
            },
          ],
        });
      }

      // Validar cada asset
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (!asset.policyid || typeof asset.policyid !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Formato de asset inválido',
            details: [
              {
                code: 'invalid_format',
                message: `assets[${i}].policyid es requerido y debe ser un string`,
                field: `body.assets[${i}].policyid`,
              },
            ],
          });
        }

        if (!asset.tokens || typeof asset.tokens !== 'object' || Array.isArray(asset.tokens)) {
          return res.status(400).json({
            success: false,
            error: 'Formato de asset inválido',
            details: [
              {
                code: 'invalid_format',
                message: `assets[${i}].tokens es requerido y debe ser un objeto`,
                field: `body.assets[${i}].tokens`,
              },
            ],
          });
        }

        // Validar que tokens tenga al menos un elemento
        if (Object.keys(asset.tokens).length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Formato de asset inválido',
            details: [
              {
                code: 'invalid_format',
                message: `assets[${i}].tokens debe contener al menos un token`,
                field: `body.assets[${i}].tokens`,
              },
            ],
          });
        }

        // Validar que las cantidades sean números positivos
        for (const [tokenName, quantity] of Object.entries(asset.tokens)) {
          if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({
              success: false,
              error: 'Formato de asset inválido',
              details: [
                {
                  code: 'invalid_format',
                  message: `assets[${i}].tokens["${tokenName}"] debe ser un número entero positivo`,
                  field: `body.assets[${i}].tokens["${tokenName}"]`,
                },
              ],
            });
          }
        }
      }
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
      amount_ada,
      to_address,
      ...(from_address_index !== undefined && { from_address_index }),
      ...(metadata && { metadata }),
      // Agregar assets si están presentes y son válidos
      ...(assets && Array.isArray(assets) && assets.length > 0 && { assets }),
    };

    console.log('Llamando a Wallet API:', `${WALLET_API_BASE}/transactions/build`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${WALLET_API_BASE}/transactions/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Verificar si la respuesta es exitosa antes de parsear
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Error al parsear JSON de respuesta:', parseError);
        return res.status(500).json({
          success: false,
          error: 'Error al parsear la respuesta del servidor',
          details: [
            {
              code: 'parse_error',
              message: 'La respuesta del servidor no es un JSON válido',
              field: 'response',
            },
          ],
        });
      }
    } else {
      // Si no es JSON, leer como texto
      const textData = await response.text();
      console.log('Response text (no JSON):', textData);
      return res.status(response.status).json({
        success: false,
        error: 'Respuesta inesperada del servidor',
        details: [
          {
            code: 'unexpected_content_type',
            message: `Se esperaba JSON pero se recibió: ${contentType}`,
            field: 'response',
          },
        ],
      });
    }

    // Reenviar la respuesta del API externo tal cual (con su status code)
    // El manejo de errores se hace en walletApi.ts
    res.status(response.status).json(data);
  } catch (error) {
    // Solo manejar errores de red/proxy mismo, no normalizar
    console.error('Error en proxy de build de transacción:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de construcción de transacción',
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
