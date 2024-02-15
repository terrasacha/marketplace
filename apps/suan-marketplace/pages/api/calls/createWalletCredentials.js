
export default async function handler(req, res) {
    const url = 'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/wallet/create-wallet/';

    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || ''
            },
            body: req.body,
        })
    const data = await response.json()

    res.status(200).json(data)
}

