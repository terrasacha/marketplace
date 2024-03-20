import { getScriptsList } from '@marketplaces/data-access';
export default async function handler(req, res) {
  const scriptsList = await getScriptsList();
  res.status(200).json(scriptsList);
}
