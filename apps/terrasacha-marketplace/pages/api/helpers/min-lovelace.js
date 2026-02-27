export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body;

      const WALLET_API_ROOT =
        process.env.NEXT_PUBLIC_WALLET_API_BASE ||
        'https://i7smbwdmuf.us-east-2.awsapprunner.com';
      const WALLET_API_BASE = `${WALLET_API_ROOT}/api/v1`;
      const WALLET_API_KEY = process.env.NEXT_PUBLIC_WALLET_API_KEY || '';

      const url = `${WALLET_API_BASE}/transactions/min-lovelace/`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(WALLET_API_KEY && { 'x-api-key': WALLET_API_KEY }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: errorData.error || 'Error al calcular min lovelace',
          details: errorData.details || {},
        });
      }

      const responseData = await response.json();

      // Manejar respuesta: puede ser { min_lovelace, min_ada } o un número
      let minLovelaceValue;
      if (typeof responseData === 'object' && responseData !== null) {
        // Si es un objeto, extraer min_lovelace
        minLovelaceValue = responseData.min_lovelace || responseData.minLovelace;
      } else if (typeof responseData === 'number') {
        // Si es un número, usarlo directamente
        minLovelaceValue = responseData;
      } else {
        // Si no es ninguno de los anteriores, intentar parsear
        minLovelaceValue = responseData;
      }

      // Retornar min_lovelace como número para mantener compatibilidad
      res.status(200).json(minLovelaceValue);
    } catch (error) {
      console.error('Error en min-lovelace endpoint:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
