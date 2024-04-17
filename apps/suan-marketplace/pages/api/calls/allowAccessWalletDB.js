
export default async function handler(req, res) {
    const { address } = req.query;
    const wallet_address = address
    console.log(wallet_address)
    const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/query-wallet/balance/`

    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || ''
            },
            body: JSON.stringify([wallet_address]),
        })
    const data = await response.json()
    res.status(200).json(data)
}