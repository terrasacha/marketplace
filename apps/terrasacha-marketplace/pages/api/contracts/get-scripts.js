import { getScriptsList } from '@marketplaces/data-access';
export default async function handler(req, res) {
  const scriptsList = await getScriptsList(process.env['NEXT_PUBLIC_MARKETPLACE_NAME']);
  res.status(200).json(scriptsList);
}
