import { getProjectTokenDistribution } from '@marketplaces/data-access';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const projectId = req.query.projectId;
    if (projectId) {
      const response = await getProjectTokenDistribution(projectId);
      res.status(200).json(response);
    } else {
      res.status(405).json({ error: 'No ha sido enviado el id del proyecto' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
