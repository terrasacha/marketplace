import { createCoreWallet } from "../../../backend" //@marketplaces/data-access

export default async function handler(req,res){
    const response = await createCoreWallet(req.query.walletID, req.query.walletName)
    console.log(response.response.data.data)
    if(!response.response.data.data.createWallet){
        res.status(409).json({created: false, message: 'La billetera ya existe en la DB'})
    }
    res.status(200).json({created: true, message: 'Billetera creada'})
}