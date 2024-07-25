import { updateOrder } from "@marketplaces/data-access"

export default async function handler(req,res){
    const payload = req.body
    let response = await updateOrder(payload)
    res.status(200).json(response)
}
