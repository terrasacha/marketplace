import { checkWalletAddressOnDB } from '../../../backend/index'

export default async function handler(req,res){
    let response = await checkWalletAddressOnDB(req.query.walletAddress, req.query.userID)
    res.status(200).json(response)
}