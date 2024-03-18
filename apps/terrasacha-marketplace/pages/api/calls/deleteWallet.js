import { deleteWallet } from "@marketplaces/data-access"

export default async function handler(req, res) {
    try {
        const id = req.body;
        if (!id) {
            return res.status(400).json({ error: "Missing ID in request body" });
        }

        const response = await deleteWallet(id);
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Error in deleteWallet handler:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
