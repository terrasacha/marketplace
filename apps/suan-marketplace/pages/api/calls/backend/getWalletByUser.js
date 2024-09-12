
import { getWalletByUser } from '@marketplaces/data-access';
export default async function handler(req, res) {
    const response = await getWalletByUser(req.body)
    res.status(200).json(response)
}