import { updateScriptById } from '@marketplaces/data-access';
export default async function handler(req, res) {
  try {
    const data = req.body;
    const policyID = data.policyID;
    const newStatus = data.newStatus;
    
    if (policyID) {
      const response = await updateScriptById(policyID, newStatus);
      res.status(200).json(response);
    } else {
      res.status(500).json({ error: 'No has ingresado un id valido' });
    }
  } catch (error) {
    console.error('Error occurred while updating wallet:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
