import { useEffect, useState } from 'react';
import { getActualPeriod } from '@marketplaces/utils-2';

interface TransactionData {
  tokenName: string;
  transactionDetails: TransactionDetail[];
  amountOfTokens: number;
}

interface TransactionDetail {
  createdAt: string;
  amountOfTokens: number;
  product: Product;
}

interface Product {
  category: {
    name: string;
  };
  createdAt: string;
  description: string;
  name: string;
  GLOBAL_TOKEN_HISTORICAL_DATA: string;
  productFeatures: {
    items: ProductFeature[];
  };
}

interface ProductFeature {
  featureID: string;
  value: string;
}

interface DetailProps {
  foundElement: TransactionData[];
}

interface TransactionItemProps {
  label: string;
  value: number | string;
  onClick?: () => void;
  price?: number;
}

interface PeriodData {
  period: any;
  startDate: Date;
  endDate: Date;
  price: number;
  amount: number;
}

const DetailItems: React.FC<DetailProps> = ({ foundElement }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [currentPeriodData, setCurrentPeriodData] = useState<PeriodData | null>(
    null
  );
  const [isTokensCompradosExpanded, setIsTokensCompradosExpanded] =
    useState<boolean>(false);
  const [tokensCompradosDetail, setTokensCompradosDetail] = useState<{
    amountOfTokens: number;
    price: number;
  } | null>(null);
  const tokensByPrice: { [key: number]: number } = {};

  useEffect(() => {
    if (foundElement.length > 0) {
      setSelectedProject(foundElement[0].tokenName);
      const totalTokensForDefaultOption = foundElement[0].amountOfTokens;
      setTotalTokens(totalTokensForDefaultOption);
      updateCurrentPeriodData(foundElement[0]);
    }
  }, [foundElement]);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProjectName = event.target.value;
    setSelectedProject(selectedProjectName);
    const selectedElement = foundElement.find(
      (item) => item.tokenName === selectedProjectName
    );
    if (selectedElement) updateCurrentPeriodData(selectedElement);
  };

  const handleTokensCompradosClick = (
    amountOfTokens: number,
    price: number
  ) => {
    setIsTokensCompradosExpanded(!isTokensCompradosExpanded);
    if (!isTokensCompradosExpanded) {
      setTokensCompradosDetail({ amountOfTokens, price });
    } else {
      setTokensCompradosDetail(null);
    }
  };

  const getPriceForToken = (token: TransactionDetail, historicalData: any) => {
    const tokenDate = new Date(token.createdAt);
    const currentPeriodData = getActualPeriod(tokenDate, historicalData);
    if (currentPeriodData) {
      return currentPeriodData.price;
    }
    return 0;
  };

  const updateCurrentPeriodData = (element: TransactionData) => {
    const productFeatures =
      element.transactionDetails[0].product.productFeatures.items;
    const historicalDataFeature = productFeatures.find(
      (feature) => feature.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
    );

    if (historicalDataFeature) {
      const historicalData = JSON.parse(historicalDataFeature.value);
      const currentDate = new Date();
      const currentPeriodData = getActualPeriod(currentDate, historicalData);

      if (currentPeriodData) {
        const startDate = new Date(currentPeriodData.fechaInicio);
        const endDate = new Date(currentPeriodData.fechaFin);
        setCurrentPeriodData({ ...currentPeriodData, startDate, endDate });

        // Calcular el total de tokens para el proyecto actual
        const totalTokensForCurrentProject = element.amountOfTokens;
        setTotalTokens(totalTokensForCurrentProject);
      } else {
        setCurrentPeriodData(null);
      }
    } else {
      setCurrentPeriodData(null);
    }
  };

  const calculateInvestment = () => {
    const selectedProjectData = foundElement.find(
      (item) => item.tokenName === selectedProject
    );

    if (selectedProjectData) {
      const historicalDataFeature =
        selectedProjectData.transactionDetails[0].product.productFeatures.items.find(
          (feature) => feature.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
        );

      if (historicalDataFeature) {
        const historicalData = JSON.parse(historicalDataFeature.value);
        const totalInvestment = selectedProjectData.transactionDetails.reduce(
          (accumulator, transaction) => {
            const priceForToken = getPriceForToken(transaction, historicalData);
            return accumulator + priceForToken * transaction.amountOfTokens;
          },
          0
        );

        return totalInvestment;
      }
    }
    return 0;
  };

  const calculateGain = () => {
    if (selectedProject) {
      const selectedElement = foundElement.find(
        (item) => item.tokenName === selectedProject
      );
      if (selectedElement) {
        const historicalDataFeature =
          selectedElement.transactionDetails[0].product.productFeatures.items.find(
            (feature) => feature.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
          );

        if (historicalDataFeature) {
          const historicalData = JSON.parse(historicalDataFeature.value);
          const lastPeriod = historicalData[historicalData.length - 1];

          if (lastPeriod) {
            const lastPrice = lastPeriod.price;
            const totalTokensForCurrentProject = selectedElement.amountOfTokens;
            const investment = calculateInvestment(); // Ya tienes esta función

            const gain =
              Math.round(
                (lastPrice * totalTokensForCurrentProject - investment) * 100
              ) / 100;

            return gain;
          }
        }
      }
    }

    return 0;
  };
  let pricePrinted = false; // Variable para rastrear si ya se imprimió la información de precios

  if (isTokensCompradosExpanded) {
    foundElement
      .find((item) => item.tokenName === selectedProject)
      ?.transactionDetails.forEach((transaction, index) => {
        const priceForToken = getPriceForToken(
          transaction,
          JSON.parse(
            foundElement
              .find((item) => item.tokenName === selectedProject)
              ?.transactionDetails[0].product.productFeatures.items.find(
                (feature) =>
                  feature.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
              )?.value || '[]'
          )
        );

        // Agrupar tokens por precio
        if (tokensByPrice[priceForToken]) {
          tokensByPrice[priceForToken] += transaction.amountOfTokens;
        } else {
          tokensByPrice[priceForToken] = transaction.amountOfTokens;
        }
      });
  }

  return (
    <div className="m-2 p-2">
      <h4 className="font-semibold text-[#6b7587] flex align-center"></h4>
      <div className="project_details">
        <div className="text-sm flex items-center p-2 m-2">
          <p className="text-[#2E7D96] pr-2 font-semibold">
            Seleccione un proyecto:
          </p>
          <select
            value={selectedProject || ''}
            onChange={handleProjectChange}
            className="border border-[#A7E4EC] w-80 p-2 rounded-lg text-[#2E7D96] font-semibold"
          >
            {foundElement.map((item: TransactionData) => (
              <option key={item.tokenName} value={item.tokenName}>
                {item.tokenName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="mt-4">
        <TransactionItem
          label="Periodo actual"
          value={
            currentPeriodData !== null
              ? `${currentPeriodData.period} (${formatDate(
                  currentPeriodData.startDate
                )} - ${formatDate(currentPeriodData.endDate)})`
              : 'N/A'
          }
        />
        <TransactionItem
          label="Precio actual de Token"
          value={currentPeriodData ? currentPeriodData.price : 'N/A'}
        />
        <TransactionItem
          label="Tokens Comprados"
          value={`${totalTokens} - Ver Detalles`}
          onClick={() =>
            handleTokensCompradosClick(
              totalTokens,
              currentPeriodData?.price || 0
            )
          }
        />
        <div className="p-2 text-sm text-[#6b7587]">
          {isTokensCompradosExpanded && (
            <>
              <ul>
                {Object.keys(tokensByPrice).map((price: string, index) => (
                  <TransactionItem
                    key={index}
                    label={`Precio: $${price}`}
                    value={`Cantidad: ${tokensByPrice[parseFloat(price)]}`} // Parsea la clave a número antes de acceder
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        <TransactionItem label="Inversión" value={calculateInvestment()} />
        <TransactionItem label="Ganancia" value={calculateGain()} />
      </ul>
      {/* <div className="flex flex-col sm:flex-row">
        <div className="md:w-70 mt-4 p-4 bg-white" style={{ flex: 1 }}>
          <h3 className="text-l font-semibold">Precio</h3>
          <div className="mt-4 p-4">
            <AreaChartComponent
              selectedElement={
                foundElement.find(
                  (item) => item.tokenName === selectedProject
                ) || null
              }
            />
          </div>
        </div>
        <div className="md:w-70 mt-4 p-4 bg-white" style={{ flex: 1 }}>
          <h3 className="text-l font-semibold">Volumen</h3>
          <div className="mt-4 p-4">
            <BarChartComponent
              selectedElement={
                foundElement.find(
                  (item) => item.tokenName === selectedProject
                ) || null
              }
            />
          </div>
        </div>
      </div> */}
    </div>
  );
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  label,
  value,
  onClick,
  price,
}) => (
  <>
    <li className="flex items-center justify-between mb-2">
      <span className="text-sm text-[#6b7587] font-semibold">{label}:</span>
      <span
        className="text-sm text-[#6b7587] hover:underline cursor-pointer"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        {value}
      </span>
      {price !== undefined && (
        <span className="text-sm text-[#6b7587] font-semibold">{`Precio por Token: ${price}`}</span>
      )}
    </li>
  </>
);

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('es-ES', options);
};

export default DetailItems;
