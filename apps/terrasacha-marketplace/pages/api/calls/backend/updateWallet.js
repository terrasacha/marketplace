
import { updateWallet } from "@marketplaces/data-access"
export default async function handler(req, res) {
    const walletData = JSON.parse(req.body)
    const response = await updateWallet({
        id: walletData.id,
        name: walletData.name,
        passphrase: walletData.passphrase,
    });
    console.log(response, 'updateWallet')
    res.status(200).json(response)
}