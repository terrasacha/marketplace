export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud
      const script_type = payload.script_type;

      const payloadFixed = {
        name: payload.name,
        wallet_id: payload.wallet_id,
        tokenName: payload.tokenName,
        save_flag: payload.save_flag,
        project_id: payload.project_id,
        parent_policy_id: payload.parent_policy_id,
      };
      
      const url = `https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/contracts/create-contract/${script_type}`;

      const queryParams = new URLSearchParams(payloadFixed);

      const urlWithParams = `${url}?${queryParams.toString()}`;
      console.log(urlWithParams);

      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
