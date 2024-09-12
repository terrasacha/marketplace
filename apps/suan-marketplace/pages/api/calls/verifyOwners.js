import { verifyOwners } from "../../../backend";

export default async function handler(req,res){
  const payload = req.body
  let response = await verifyOwners(payload)
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(response)
}