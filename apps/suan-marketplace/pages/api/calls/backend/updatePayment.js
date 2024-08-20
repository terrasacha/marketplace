import { updatePayment } from '@marketplaces/data-access';
import { eventTransactionFIAT } from '@marketplaces/ui-lib/src/lib/common/event';
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
      //analytics
      eventTransactionFIAT({
        action: 'buy_token',
        category: 'marketplace',
        label: `FIAT pay`,
        token: payload.x_description,
        amount: payload.x_amount,
        currency: payload.x_currency_code,
        tax: payload.x_tax,
        transaction_status: payload.x_cod_transaction_state,
        x_ref_payco: payload.x_ref_payco,
        customer_email: payload.x_customer_email
      });
      res.status(200).json(updatedOrderResponse);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred updating order:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
