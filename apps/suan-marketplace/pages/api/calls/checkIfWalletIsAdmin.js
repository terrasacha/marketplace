import { checkIfWalletIsAdmin } from '../../../backend/index'

export default async function handler(req,res){
    let response = await checkIfWalletIsAdmin(req.query.data)
    res.status(200).json(response)
}