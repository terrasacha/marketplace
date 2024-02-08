import { getWalletByUser } from '@marketplaces/data-access';
const apikey = process.env.API_KEY_PLATAFORMA
const graphqlenpoint = process.env.GRAPHQL_ENDPOINT
export default async function handler(req, res) {
    const response = await getWalletByUser(req.body, apikey, graphqlenpoint)
    res.status(200).json(response)
}