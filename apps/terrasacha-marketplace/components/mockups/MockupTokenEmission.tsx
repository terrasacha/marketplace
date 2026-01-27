// Interface basada en la estructura real de datos de la plataforma
interface TokenEmissionItem {
  period: string; // item.period desde tokenHistoricalData
  endDate: string; // item.date es la fecha de CIERRE del período
  tokens: number; // item.amount desde tokenHistoricalData
  price: number; // item.price desde tokenHistoricalData
  tir: number; // item.tir desde tokenHistoricalData
  currency: string; // Moneda del token
  status: 'Completado' | 'En Curso' | 'Pendiente'; // Calculado basado en fecha de cierre
}

interface MockupTokenEmissionProps {
  project?: any;
}

const formatDate = (dateString: string, format: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

const getPeriodStatus = (endDate: string): 'Completado' | 'En Curso' | 'Pendiente' => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  if (today > end) return 'Completado';
  if (today <= end) return 'En Curso'; // Si aún no llega la fecha de cierre, está en curso
  return 'Pendiente';
};

const MockupTokenEmission = ({ project }: MockupTokenEmissionProps) => {
  let emissionData: TokenEmissionItem[] = [];

  // Intentar obtener datos reales del proyecto
  if (project?.productFeatures?.items) {
    const tokenHistoricalDataFeature = project.productFeatures.items.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
    );

    if (tokenHistoricalDataFeature?.value) {
      try {
        const tokenHistoricalData = JSON.parse(tokenHistoricalDataFeature.value);
        
        // Ordenar períodos por fecha
        const sortedPeriods = [...tokenHistoricalData].sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Obtener moneda del token
        const tokenCurrencyFeature = project.productFeatures.items.find(
          (pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY'
        );
        const currency = tokenCurrencyFeature?.value || 'USD';

        emissionData = sortedPeriods.map((item: any, index: number) => {
          // item.date es la fecha de CIERRE del período
          const endDate = formatDate(item.date, 'DD/MM/YYYY');
          const status = getPeriodStatus(item.date);

          return {
            period: item.period || `Fase ${index + 1}`,
            endDate,
            tokens: parseInt(item.amount || 0),
            price: parseFloat(item.price || 0),
            tir: parseFloat(item.tir || 0),
            currency,
            status,
          };
        });
      } catch (error) {
        // Error parsing GLOBAL_TOKEN_HISTORICAL_DATA
      }
    }
  }

  // Si no hay datos reales, no mostrar el componente
  if (emissionData.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200';
      case 'En Curso':
        return 'bg-gradient-to-r from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 text-white border border-custom-marca-boton';
      case 'Pendiente':
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></div>
        <h3 className="text-xl font-jostBold text-custom-dark">
          Emisión de Tokens por Período
        </h3>
      </div>
      <div className="rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-custom-marca-boton/10 to-custom-marca-boton-alterno2/10 border-b-2 border-custom-marca-boton">
              <th className="text-left py-3 px-4 font-jostBold text-sm text-custom-dark">
                Período
              </th>
              <th className="text-left py-3 px-4 font-jostBold text-sm text-custom-dark">
                Fecha de Cierre
              </th>
              <th className="text-right py-3 px-4 font-jostBold text-sm text-custom-dark">
                Tokens
              </th>
              <th className="text-right py-3 px-4 font-jostBold text-sm text-custom-dark">
                Precio
              </th>
              <th className="text-right py-3 px-4 font-jostBold text-sm text-custom-dark">
                TIR
              </th>
              <th className="text-center py-3 px-4 font-jostBold text-sm text-custom-dark">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {emissionData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/10 hover:to-transparent transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="py-3 px-4 font-jostBold text-sm text-custom-dark group-hover:scale-105 transition-transform">
                  {item.period}
                </td>
                <td className="py-3 px-4 font-jostRegular text-sm text-gray-600">
                  {item.endDate}
                </td>
                <td className="py-3 px-4 font-jostBold text-sm text-custom-dark text-right group-hover:text-custom-marca-boton transition-colors">
                  {item.tokens.toLocaleString('es-ES')}
                </td>
                <td className="py-3 px-4 font-jostBold text-sm text-custom-dark text-right group-hover:text-custom-marca-boton transition-colors">
                  ${item.price.toFixed(2)} {item.currency}
                </td>
                <td className="py-3 px-4 font-jostBold text-sm text-custom-marca-boton text-right">
                  {item.tir}%
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-xs font-jostBold shadow-sm transition-all duration-300 hover:scale-110 ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MockupTokenEmission;

