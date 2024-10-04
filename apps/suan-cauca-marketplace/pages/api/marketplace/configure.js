import { updateMarketplaceOracleWalletAddress } from "@marketplaces/data-access";

export default async function handler(req, res) {
  const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud

  const oracleWalletName =
    `${process.env['NEXT_PUBLIC_MARKETPLACE_NAME']}ORACLE${process.env['NEXT_PUBLIC_ENV']}`.toUpperCase();

  const urlSendAccessToken = `${
    process.env['NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT']
  }/api/v1/helpers/send-access-token/?wallet_id=${
    payload.walletID
  }&destinAddress=${payload.walletAddress}&marketplace_id=${process.env[
    'NEXT_PUBLIC_MARKETPLACE_NAME'
  ]?.toLocaleLowerCase()}&save_flag=true`;

  const urlCreateOracleDatum = `${process.env['NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT']}/api/v1/helpers/oracle-datum/Create?oracle_wallet_name=${oracleWalletName}`;
  try {
    const responseSendAccessToken = await fetch(urlSendAccessToken, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env['NEXT_PUBLIC_API_KEY_ENDPOINT'] || '',
      },
    });
    if (!responseSendAccessToken.ok) {
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
    const sendAccesTokenResponse = await responseSendAccessToken.json();

    const responseCreateOracle = await fetch(urlCreateOracleDatum, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env['NEXT_PUBLIC_API_KEY_ENDPOINT'] || '',
      },
      body: JSON.stringify({ data: [], validity: 86400000 }),
    });
    if (!responseCreateOracle.ok) {
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
    const createOracleResponse = await responseCreateOracle.json();

    await updateMarketplaceOracleWalletAddress(createOracleResponse.oracle_address)

    console.log('sendAccesTokenResponse', sendAccesTokenResponse)
    console.log('createOracleResponse', createOracleResponse)
    res.status(200).json({
      sendAccesToken: sendAccesTokenResponse,
      createOracle: createOracleResponse,
    });
  } catch (error) {
    console.error('Error configurando marketplace:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
