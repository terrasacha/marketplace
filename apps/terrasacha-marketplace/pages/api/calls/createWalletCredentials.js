
export default async function handler(req, res) {
    const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/create-wallet/`;

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

