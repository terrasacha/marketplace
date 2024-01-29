
export default async function handler(req, res) {
    const { size } = req.query;
    const url = `https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/wallet/generate-words/?size=${size}`

    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY_ENDPOINT || ''
            },
        })
    const data = await response.json()
    console.log(data)
    res.status(200).json(data)
}