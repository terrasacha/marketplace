
export default async function handler(req, res) {
    const { address } = req.query;
    const wallet_address = address
    console.log(wallet_address)
    const url = 'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/wallet/query-wallet/balance/'

    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY_ENDPOINT || ''
            },
            body: JSON.stringify([wallet_address]),
        })
    const data = await response.json()
    res.status(200).json(data)
}