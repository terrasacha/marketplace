import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { crypto, base_currency } = req.query;

    if (!base_currency || !crypto) {
      return res
        .status(400)
        .json({ error: "Currency and Crypto parameters are required." });
    }

    const baseCurrencyString = Array.isArray(base_currency)
      ? base_currency[0]
      : base_currency;
    const cryptoString = Array.isArray(crypto)
      ? crypto[0]
      : crypto;

    let exchangeRate: number = 1;
    console.log(baseCurrencyString)
    if (baseCurrencyString.toUpperCase() !== "USD") {
      exchangeRate =
        (await obtenerTasaDeCambio(baseCurrencyString, "USD")) || 0;
    }
    try {
      if (exchangeRate === 0) {
        throw new Error("Conversion no valida");
      }
      const apiUrl = `https://api.coingecko.com/api/v3/simple/price`;
      const response = await fetch(`${apiUrl}?ids=${crypto}&vs_currencies=usd`);
      const data = await response.json();
      console.log("data", data);
      const adaUsdRate = data[cryptoString]?.usd;
      const finalRate = parseFloat(adaUsdRate) / exchangeRate;
      // console.log("exchangeRate", exchangeRate);
      // console.log("adaUsdRate", adaUsdRate);
      // console.log("finalRate", finalRate);
      res.status(200).json({
        adausd: adaUsdRate,
        finalRate: finalRate,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

async function obtenerTasaDeCambio(monedaBase: string, monedaObjetivo: string) {
  const apiKey = "b3b4b51f34bb86c40602e18f";
  const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
  try {
    // Realizar la solicitud a la API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Verificar si la solicitud fue exitosa
    if (response.ok) {
      // Obtener las tasas de cambio
      const tasasDeCambio = data.conversion_rates;

      // Verificar si las monedas proporcionadas son válidas
      if (
        tasasDeCambio.hasOwnProperty(monedaBase) &&
        tasasDeCambio.hasOwnProperty(monedaObjetivo)
      ) {
        // Calcular la tasa de cambio
        const tasaDeCambio =
          tasasDeCambio[monedaObjetivo] / tasasDeCambio[monedaBase];
        return tasaDeCambio;
      } else {
        throw new Error("Moneda no válida");
      }
    } else {
      throw new Error(`Error en la solicitud: ${data.error_type}`);
    }
  } catch (error) {
    console.error("Error al intentar convertir currency");
  }
}
