// Interface basada en la estructura real de datos de la plataforma
interface TokenDetailsData {
  totalTokens: number;
  currentPrice: number;
  priceCurrency: string;
  availableTokens: number;
  tokenName: string;
}

interface MockupTokenDetailsProps {
  project?: any;
}

const getActualPeriod = (currentDate: Date, periods: any[]) => {
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (let i = sortedPeriods.length - 1; i >= 0; i--) {
    const periodDate = new Date(sortedPeriods[i].date);
    if (currentDate >= periodDate) {
      return sortedPeriods[i];
    }
  }
  
  return sortedPeriods[0] || null;
};

const MockupTokenDetails = ({ project }: MockupTokenDetailsProps) => {
  let tokenData: TokenDetailsData | null = null;

  // Obtener datos reales del proyecto
  if (project?.productFeatures?.items) {
    const productFeatures = project.productFeatures.items;

    // Token Name - Si no existe, usar el nombre del proyecto como fallback
    const tokenNameFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_NAME'
    );
    const tokenName = tokenNameFeature?.value || project?.name?.replace('Proyecto - ', '') || '';

    // Token Currency
    const tokenCurrency = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY'
    )?.value || 'USD';

    // Total de tokens - Usar GLOBAL_TOKEN_TOTAL_AMOUNT si existe, sino calcular desde historical data
    const tokenTotalAmountFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_TOTAL_AMOUNT'
    );
    let totalTokens = tokenTotalAmountFeature?.value 
      ? parseInt(tokenTotalAmountFeature.value) 
      : 0;

    // Token Historical Data - para precio actual
    const tokenHistoricalDataFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
    );

    let currentPrice = 0;

    if (tokenHistoricalDataFeature?.value) {
      try {
        const tokenHistoricalData = JSON.parse(tokenHistoricalDataFeature.value);
        
        // Si no hay GLOBAL_TOKEN_TOTAL_AMOUNT, calcular desde historical data
        if (!totalTokens) {
          totalTokens = tokenHistoricalData.reduce(
            (sum: number, item: any) => sum + parseInt(item.amount || 0),
            0
          );
        }

        // Obtener precio del período actual
        const periods = tokenHistoricalData.map((tkhd: any) => ({
          period: tkhd.period,
          date: new Date(tkhd.date),
          price: parseFloat(tkhd.price || 0),
          amount: parseInt(tkhd.amount || 0),
        }));

        const actualPeriod = getActualPeriod(new Date(), periods);
        currentPrice = actualPeriod?.price || 0;
      } catch (error) {
        // Error parsing GLOBAL_TOKEN_HISTORICAL_DATA
      }
    }

    // Token Amount Distribution - obtener tokens del INVERSIONISTA
    const tokenAmountDistributionFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
    );
    let investorTokens = 0;
    
    if (tokenAmountDistributionFeature?.value) {
      try {
        const distributionData = JSON.parse(tokenAmountDistributionFeature.value);
        // Buscar específicamente los tokens del INVERSIONISTA
        const investorDistribution = distributionData.find(
          (item: any) => item.CONCEPTO === 'INVERSIONISTA'
        );
        investorTokens = parseInt(investorDistribution?.CANTIDAD || 0);
      } catch (error) {
        // Error parsing GLOBAL_TOKEN_AMOUNT_DISTRIBUTION
      }
    }

    // Tokens disponibles = tokens del inversionista (para venta)
    const availableTokens = investorTokens;

    // Solo crear tokenData si tenemos datos mínimos
    if (tokenName || totalTokens > 0) {
      tokenData = {
        totalTokens,
        currentPrice,
        priceCurrency: tokenCurrency,
        availableTokens,
        tokenName,
      };
    }
  }

  // Si no hay datos reales, no mostrar el componente
  if (!tokenData || (!tokenData.totalTokens && !tokenData.tokenName)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-scale-in">
      <h3 className="text-xl font-jostBold text-custom-dark mb-6">
        Detalles del Token
      </h3>
      <div className="space-y-4">
        {/* Total de Tokens */}
        <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton-alterno2 to-custom-marca-boton-alterno rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-custom-marca-boton"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-jostRegular">Total de Tokens</p>
                <p className="text-lg font-jostBold text-custom-dark">
                  {tokenData.totalTokens.toLocaleString('es-ES')} TOKENS
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Precio Actual */}
        <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton-alterno2 to-custom-marca-boton-alterno rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-custom-marca-boton"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-jostRegular">Precio Actual</p>
                <p className="text-lg font-jostBold text-custom-dark">
                  {tokenData.currentPrice.toFixed(2)} {tokenData.priceCurrency} / TOKEN
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Disponibles */}
        <div className="bg-gradient-to-r from-custom-marca-boton-alterno2/20 to-custom-marca-boton-alterno/10 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-custom-marca-boton-alterno2/30 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-jostRegular">Tokens Disponibles</p>
                <p className="text-lg font-jostBold text-custom-marca-boton">
                  {tokenData.availableTokens.toLocaleString('es-ES')} TOKENS
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MockupTokenDetails;

