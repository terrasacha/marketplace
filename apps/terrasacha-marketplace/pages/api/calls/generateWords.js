
export default async function handler(req, res) {
    const { size } = req.query;
    const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/generate-words/?size=${size}`

    const response = await fetch(url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || ''
            },
        })
    const data = await response.json()
    console.log(data)
    res.status(200).json(data)
}