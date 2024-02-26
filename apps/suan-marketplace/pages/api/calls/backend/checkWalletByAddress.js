import { getWalletByStakeAddress } from "@marketplaces/data-access"
export default async function handler(req, res) {
    try {
        const walletData = JSON.parse(req.body)
        console.log(walletData, 'walletData')
        const response = await getWalletByStakeAddress(walletData.stake_address)
        const data = response.data.data.listWallets.items[0]
        console.log(data, 'datacheckWalletbyAddress')
        res.status(200).json({ msg: 'success', data: data || false })
    } catch (error) {
        console.error("Error occurred while updating wallet:", error)
        res.status(500).json({ error: "An error occurred while updating wallet" })
    }
}
