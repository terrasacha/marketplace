import { createExternalWallet } from "@marketplaces/data-access"
export default async function handler(req, res) {
    try {
        const walletData = JSON.parse(req.body)
        const response = await createExternalWallet(walletData.address, walletData.stake_address, walletData.claimed_token)
        res.status(200).json({ msg: 'success', data: response.data.data.createWallet || false })
    } catch (error) {
        console.error("Error occurred while updating wallet:", error)
        res.status(500).json({ error: "An error occurred while updating wallet" })
    }
}
