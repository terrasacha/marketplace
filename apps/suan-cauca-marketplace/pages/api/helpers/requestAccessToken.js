import { checkClaimedToken, createClaimedToken, getScriptTokenAccess } from "@marketplaces/data-access";
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const result = await getTokenScript()
            const payload = req.query.destinAddress;
            const walletID = req.query.walletID
            const claimed_token_check = await checkClaimedToken(result.marketplace, walletID)
            console.log(claimed_token_check, 'claimed_token_check')
            if(!claimed_token_check){
                const result_create_claimed_token = await createClaimedToken(result.marketplace, walletID)
            }
            console.log(payload)
            const url =
                `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/helpers/send-access-token/?wallet_id=${result.wallet_id}&destinAddress=${payload}&marketplace_id=${result.marketplace}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
                }
            });
            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
        console.log(req.query, 'req')
    } else {
        res.status(405).json({ error: 'Método no permitido' });
    }
}

const getTokenScript = async () => {
    const marketplace = process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLocaleLowerCase() || ''
    if(marketplace === '') return console.log('variable de entorno de marketplace no especificada')
    
    try {
        const result = await getScriptTokenAccess(marketplace)
        return {
            id: result.data.listScripts.items[0].id,
            wallet_id: result.data.listScripts.items[0].pbk[0],
            marketplace: result.data.listScripts.items[0].marketplaceID,
        }
    } catch (error) {
        return { error: 'error en la solicitud'}
    }
}
