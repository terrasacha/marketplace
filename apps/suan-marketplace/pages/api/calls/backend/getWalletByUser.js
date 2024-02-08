
import { getWalletByUser } from '@marketplaces/data-access';
export default async function handler(req, res) {
    const API_KEY = process.env.API_KEY_PLATAFORMA
    const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT
    const getWalletByUser = async (userId, API_KEY, GRAPHQL_ENDPOINT) => {
        let output = ''
        let response = ''
        try {
            response = await axios.post(
                GRAPHQL_ENDPOINT,
                {
                    query: `query getWalletByUser {
                getUser(id: "${userId}") {
                  wallets {
                    items {
                      id
                      address
                      name
                    }
                  }
                }
              }`,
                },
                {
                    headers: {
                        'x-api-key': API_KEY,
                    },
                }
            );
            //@ts-ignore
            output = response.data.data.getUser?.wallets?.items || [];
        } catch (error) {
            console.log(error)
            throw error
        }
        console.log(output)
        return output;
    }

    const response = await getWalletByUser(req.body, API_KEY, GRAPHQL_ENDPOINT)
    res.status(200).json(response)
}