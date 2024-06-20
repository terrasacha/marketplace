import { listTokens } from "@marketplaces/data-access"

export default async function handler(req,res){
    let response = await listTokens()
    res.status(200).json(response)
}