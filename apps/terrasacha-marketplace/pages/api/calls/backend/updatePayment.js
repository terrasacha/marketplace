import { updatePayment } from '@marketplaces/data-access';

const statudCode = {
  1: 'Aceptada',
  2: 'Aceptada',
  3: 'Aceptada',
  4: 'Aceptada',
  5: 'Aceptada',
  6: 'Aceptada',
}

const fechaAAwsTimestamp = (fechaStr) => {
  // Intentar convertir la fecha string a un objeto Date directamente
  const fecha = new Date(fechaStr);

  // Verificar si la fecha es válida
  if (isNaN(fecha.getTime())) {
      throw new Error("Fecha inválida");
  }

  // Obtener el Unix timestamp en segundos
  const awstimestamp = Math.floor(fecha.getTime() / 1000);

  return awstimestamp;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const payload = req.body;

      const data = {
        id: payload.x_id_invoice,
        ref: payload.x_ref_payco,
        statusCode: payload.x_cod_response,
        timestamp: fechaAAwsTimestamp(payload.x_transaction_date),
      };
      const updatedOrderResponse = await updatePayment(data);

      res.status(200).json(updatedOrderResponse);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred updating order:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
