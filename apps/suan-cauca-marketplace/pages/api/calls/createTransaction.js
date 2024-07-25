import { createTransaction } from "@cauca/backend"

export default async function handler(req,res){
    const payload = req.body
    let response = await createTransaction(payload)
    res.status(200).json(response)
}