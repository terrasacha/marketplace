export default async function handler(req, res) {
  const { policy_id } = req.query;
  const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/asset-info/?policy_id=${policy_id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
    },
  });
  const data = await response.json();
  res.status(200).json(data);
}
