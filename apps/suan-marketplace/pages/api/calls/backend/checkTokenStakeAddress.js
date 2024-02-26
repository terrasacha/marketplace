export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const payload = {
                stake: req.body,
                after_block_height: 0,
                skip: 0,
                limit: 10,
                all: true
            }
            console.log(payload, 'payload')
            const url =
                `https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/wallet/account-tx/?stake=${req.body}&all=true`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
                }
            });

            const data = await response.json();
            console.log(data, 'data')
            const tokenAccess = validateTokenAccess(data.data)
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
    } else {
        res.status(405).json({ error: 'Método no permitido' });
    }
}


function validateTokenAccess(data) {
    let token_send = 0
    let token_recieved = 0

    data.forEach(item => {

    })

}