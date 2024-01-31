
import { createUser } from "@marketplaces/data-access"
export default async function handler(req, res) {
    const userData = JSON.parse(req.body)
    const response = await createUser(userData)
    res.status(200).json(response)
}