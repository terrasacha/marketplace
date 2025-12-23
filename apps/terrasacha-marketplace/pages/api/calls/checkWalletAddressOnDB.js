import { checkAndCreateWalletOnDB } from '../../../backend/index'

export default async function handler(req,res){
    let response = await checkAndCreateWalletOnDB(req.query.walletAddress, req.query.userID)
    res.status(200).json(response)
}