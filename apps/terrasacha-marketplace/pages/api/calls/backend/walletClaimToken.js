import { claimToken } from "@marketplaces/data-access"
export default async function handler(req, res) {
    try {
        const walletData = JSON.parse(req.body)
        const response = await claimToken({
            id: walletData.id
        })
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        console.error("Error occurred while updating wallet:", error)
        res.status(500).json({ error: "An error occurred while updating wallet" })
    }
}
