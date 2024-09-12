import { getProjects } from '../../../backend/index';

export default async function handler(req, res) {
    try {
        // Validación de encabezados
        if (!req.headers.CoreWallet || req.headers.CoreWallet === '') {
            console.log(req.headers['CoreWallet'])
            return res.status(400).json({ error: 'El encabezado coreWallet es requerido.' });
        }

        // Obtener proyectos
        const projects = await getProjects();
        console.log(projects)
        // Respuesta exitosa
        return res.status(200).json(projects);
    } catch (error) {
        // Manejo de errores
        console.error('Error en la solicitud:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}
