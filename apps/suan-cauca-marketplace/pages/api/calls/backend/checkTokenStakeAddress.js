export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            let stake_address = req.body
            const url =
                `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/account-utxo/?stake=${stake_address}&all=true`;

            console.log('stake_address', stake_address)

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
                }
            });

            const data = await response.json();
            const tokenAccess = validateTokenAccess(data.data)
            res.status(200).json(tokenAccess);
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
    } else {
        res.status(405).json({ error: 'Método no permitido' });
    }
}

function validateTokenAccess(data) {
    let hasTokenAuth = false
    data.some(item => {
        item.asset_list.some(asset => {
            if (asset.policy_id === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER
                && asset.asset_name === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME_HEX) {
                hasTokenAuth = true
            }
        })
    })
    return hasTokenAuth
}
/* function validateTokenAccess(data, stake_address) {
    let token_recieved = 0
    let token_send = 0

    data.map(item => {
        item.inputs.map(item2 => {
            if (item2.stake_addr === stake_address && item2.asset_list.length > 0) {
                item2.asset_list.map(asset => {
                    if (asset.policy_id === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER
                        && asset.asset_name === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME_HEX) {
                        return token_send += parseInt(asset.quantity)
                    }
                })
            }
        })
        item.outputs.map(item2 => {
            if (item2.stake_addr === stake_address && item2.asset_list.length > 0) {
                item2.asset_list.map(asset => {
                    if (asset.policy_id === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER
                        && asset.asset_name === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME_HEX) {
                        return token_recieved += parseInt(asset.quantity)
                    }
                })
            }
        })
    })

    console.log(token_recieved, 'token_recieved')
    console.log(token_send, 'token_send')
    console.log(token_recieved - token_send, 'me quedan')
    return token_recieved - token_send

} */