import { getProjectData } from '@marketplaces/data-access';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const projectId = req.query.projectId;
    if (projectId) {
      const projectData = await getProjectData(projectId);
      res.status(200).json(projectData);
    } else {
      res.status(405).json({ error: 'No ha sido enviado el id del proyecto' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
