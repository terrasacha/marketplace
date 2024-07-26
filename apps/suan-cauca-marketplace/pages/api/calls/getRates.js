import { getRates } from "@marketplaces/data-access"

export default async function handler(req,res){
    let response = await getRates()
    res.status(200).json(response)
}