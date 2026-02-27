import { getWalletByUser } from '@marketplaces/data-access';

export default async function handler(req, res) {
  const userId = req.body?.userId ?? (typeof req.body === 'string' ? req.body : null);
  const response = await getWalletByUser(userId);
  res.status(200).json(response);
}