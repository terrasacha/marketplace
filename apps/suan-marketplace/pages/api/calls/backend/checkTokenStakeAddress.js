import { getScriptTokenAccess } from "@marketplaces/data-access";
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      let address = req.body;
      const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/wallet/address-details/?address=${address}`;

      console.log('address', address);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
      });

      const data = await response.json();
      console.log('function handler',data)

      const tokenAccess = await validateTokenAccess(data);
      res.status(200).json(tokenAccess);
    } catch (error) {
      console.log(error)
      res.status(500).json(false);
    }
  } else {
    res.status(405).json(false);
  }
}

async function validateTokenAccess(data) {
  const result = await getTokenScript()
  console.log(`${result.id}${process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME_HEX}`)
  let hasTokenAuth = false;
  data?.amount.some((item) => {
    if (
      item.unit ===
      `${result.id}${process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME_HEX}`
    ) {
      hasTokenAuth = true;
    }
  });
  return hasTokenAuth;
}

const getTokenScript = async () => {
  const marketplace = process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLocaleLowerCase() || ''
  if(marketplace === '') return console.log('variable de entorno de marketplace no especificada')
  
  try {
      const result = await getScriptTokenAccess(marketplace)
      return {
          id: result.data.listScripts.items[0].id,
          wallet_id: result.data.listScripts.items[0].pbk[0],
          marketplace: result.data.listScripts.items[0].marketplaceID,
      }
  } catch (error) {
      return { error: 'error en la solicitud'}
  }
}