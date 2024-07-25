export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const payload = req.query.destinAddress;
            console.log(payload)
            const url =
                `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/helpers/send-access-token/?wallet_id=${process.env.NEXT_PUBLIC_WALLET_ID_SEND_TOKEN_ACCESS}&destinAddress=${payload}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
                }
            });
            const data = await response.json();
            console.log(data)
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
        console.log(req.query, 'req')
    } else {
        res.status(405).json({ error: 'Método no permitido' });
    }
}
