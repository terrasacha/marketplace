import { getCoreWallet } from "@marketplaces/data-access"

export default async function handler(req,res){
    let response = await getCoreWallet()
    res.status(200).json(response)
}