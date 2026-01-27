// Interface basada en la estructura real de datos de la plataforma
interface PriceHistoryItem {
  date: string;
  price: number;
  period: string;
}

interface PriceHistoryData {
  priceHistory: PriceHistoryItem[];
  currency: string;
}

interface MockupPriceHistoryProps {
  project?: any;
}

const formatDate = (dateString: string, format: string): string => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  if (format === 'MM/YY') {
    return `${month}/${year}`;
  }
  return dateString;
};

const MockupPriceHistory = ({ project }: MockupPriceHistoryProps) => {
  let priceHistoryData: PriceHistoryData | null = null;
  let currency = 'USD'; // Valor por defecto consistente

  // Obtener datos reales del proyecto
  if (project?.productFeatures?.items) {
    const productFeatures = project.productFeatures.items;
    
    // Obtener currency primero para asegurar consistencia
    const tokenCurrencyFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY'
    );
    currency = tokenCurrencyFeature?.value || 'USD';

    const tokenHistoricalDataFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
    );

    if (tokenHistoricalDataFeature?.value) {
      try {
        const tokenHistoricalData = JSON.parse(tokenHistoricalDataFeature.value);
        
        // Ordenar por fecha
        const sortedData = [...tokenHistoricalData].sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const priceHistory = sortedData.map((item: any) => ({
          date: formatDate(item.date, 'MM/YY'),
          price: parseFloat(item.price || 0),
          period: item.period || '',
        }));

        priceHistoryData = {
          priceHistory,
          currency, // Usar la variable currency ya calculada
        };
      } catch (error) {
        // Error parsing GLOBAL_TOKEN_HISTORICAL_DATA
      }
    }
  }

  // Si no hay datos reales, no mostrar el componente
  if (!priceHistoryData || priceHistoryData.priceHistory.length === 0) {
    return null;
  }

  const priceData = priceHistoryData.priceHistory;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></div>
         <h3 className="text-xl font-jostBold text-custom-dark">
          Histórico de Precios ({currency})
        </h3>
      </div>
      <div className="rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-custom-marca-boton/10 to-custom-marca-boton-alterno2/10 border-b-2 border-custom-marca-boton">
              <th className="text-left py-3 px-4 font-jostBold text-sm text-custom-dark">
                Fecha
              </th>
              <th className="text-right py-3 px-4 font-jostBold text-sm text-custom-dark">
                Precio ({currency})
              </th>
            </tr>
          </thead>
          <tbody>
            {priceData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/10 hover:to-transparent transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="py-3 px-4 font-jostRegular text-sm text-gray-600">
                  {item.date}
                </td>
                <td className="py-3 px-4 font-jostBold text-sm text-custom-dark text-right group-hover:text-custom-marca-boton group-hover:scale-110 transition-all">
                  ${item.price.toFixed(2)} {currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MockupPriceHistory;
