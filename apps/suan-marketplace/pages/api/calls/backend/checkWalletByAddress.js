import { getWalletByAddress } from "@marketplaces/data-access"
export default async function handler(req, res) {
    try {
        const walletData = JSON.parse(req.body)
        console.log(walletData, 'walletData')
        const response = await getWalletByAddress(walletData.address)
        const data = response.data.data.listWallets.items[0]
        res.status(200).json({ msg: 'success', data: data || false })
    } catch (error) {
        console.error("Error occurred while updating wallet:", error)
        res.status(500).json({ error: "An error occurred while updating wallet" })
    }
}
