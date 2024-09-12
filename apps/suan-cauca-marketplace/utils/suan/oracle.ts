//////////////////////////////////////////////////////
// The following section is to interact with the Oracle
///////////////////////////////////////////////////////
export async function coingeckoPrices(crypto: string, base_currency: string) {
  try {
    const response = await fetch(
      `/api/mint/oracle?crypto=${crypto}&base_currency=${base_currency}`
    );
    const data = await response.json();
    return data.finalRate;
  } catch (error) {
    console.error("Error", error);
  }
}
