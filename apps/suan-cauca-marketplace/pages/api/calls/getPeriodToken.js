import { getPeriodTokenData } from "@marketplaces/data-access"

export default async function handler(req,res){
    let tokens_name = JSON.parse(req.body).assets_name
    let response = await getPeriodTokenData(tokens_name)
    res.status(200).json(response)
}   