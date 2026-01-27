import Link from 'next/link';
import { MyPage } from '@terrasacha/components/common/types';
import { XIcon } from '@marketplaces/ui-lib/src/lib/icons/XIcon';
import { CheckIcon } from '@marketplaces/ui-lib/src/lib/icons/CheckIcon';
import { 
  FaCheckCircle, 
  FaCog, 
  FaFileAlt, 
  FaUniversity, 
  FaCalendarAlt, 
  FaReceipt, 
  FaCommentAlt, 
  FaDollarSign 
} from 'react-icons/fa';

// Función para formatear fecha ISO a formato legible
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} de ${month}, ${year} - ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

const PayResponsePage: MyPage = (props: any) => {
  const { infoPay } = props;
  // Determinar si es éxito basándose en el código de respuesta de Epayco
  // Códigos 1-6 son transacciones exitosas, otros son rechazadas/fallidas
  const statusCode = infoPay?.statusCode;
  const isSuccess = statusCode && ['1', '2', '3', '4', '5', '6'].includes(String(statusCode));

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden bg-white"
    >
      {/* Background with Layered waves at bottom - Both Success and Error */}
      <div className="fixed bottom-0 left-0 w-full h-[50vh] z-0 pointer-events-none">
        {/* Back Layer (Lightest) - using Terrasacha colors adapted to earth tones */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,181.3C672,160,768,128,864,122.7C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
            fill={isSuccess ? "rgba(177, 193, 129, 0.4)" : "rgba(232, 215, 154, 0.6)"}
            fillOpacity="1"
          />
        </svg>
        {/* Middle Layer */}
        <svg 
          className="absolute bottom-0 left-0 w-full"
          style={{ height: '85%' }}
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,122.7C840,117,960,139,1080,160C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" 
            fill={isSuccess ? "rgba(132, 155, 80, 0.5)" : "rgba(177, 193, 129, 0.7)"}
            fillOpacity="1"
          />
        </svg>
        {/* Front Layer (Darkest) */}
        <svg 
          className="absolute bottom-0 left-0 w-full"
          style={{ height: '60%' }}
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,96L80,106.7C160,117,320,139,480,149.3C640,160,800,160,960,144C1120,128,1280,96,1360,80L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" 
            fill={isSuccess ? "rgba(110, 108, 53, 0.6)" : "rgba(110, 108, 53, 0.8)"}
            fillOpacity="1"
          />
        </svg>
      </div>

      {infoPay && (
        <div className="flex items-center justify-center min-h-screen p-4 py-12 relative z-10 mb-10 md:mb-20">
          {/* Transaction Card */}
          <div 
            className={`rounded-3xl w-full max-w-[600px] p-10 text-center relative border shadow-2xl animate-scale-in ${
              isSuccess 
                ? 'bg-white' 
                : 'bg-[#faf8f5] border-[#e0e0e0]'
            }`}
            style={!isSuccess ? {
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)'
            } : {}}
          >
            {/* Status Icon */}
            <div className="mb-5 flex justify-center">
              {isSuccess ? (
                <div className="absolute -top-[60px] left-1/2 transform -translate-x-1/2 z-20">
                  <div 
                    className="rounded-full bg-white p-2"
                    style={{
                      boxShadow: '0 0 40px rgba(132, 155, 80, 0.3)'
                    }}
                  >
                    <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-custom-marca-boton-variante2 to-custom-marca-boton flex items-center justify-center">
                      <CheckIcon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <svg 
                  fill="none" 
                  height="120" 
                  viewBox="0 0 100 100" 
                  width="120" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto"
                >
                  {/* Concentric circles */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="rgba(110, 108, 53, 0.5)" 
                    strokeDasharray="4 4" 
                    strokeWidth="2"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    stroke="rgba(110, 108, 53, 0.3)" 
                    strokeDasharray="3 3" 
                    strokeWidth="1.5"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="30" 
                    stroke="rgba(110, 108, 53, 0.2)" 
                    strokeDasharray="2 2" 
                    strokeWidth="1"
                  />
                  {/* X icon */}
                  <path 
                    d="M35 35L65 65M65 35L35 65" 
                    stroke="#6e6c35" 
                    strokeLinecap="round" 
                    strokeWidth="8"
                  />
                  {/* Small accent lines */}
                  <path 
                    d="M50 15V10M50 90V85M85 50H90M15 50H10" 
                    opacity="0.3" 
                    stroke="#6e6c35" 
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>

            {/* Card Header Text */}
            <div className={`text-center mb-8 ${isSuccess ? 'mt-12' : ''}`}>
              <h1 className="text-2xl md:text-3xl font-jostBold text-custom-dark mb-4">
                {isSuccess ? '¡Transacción Aceptada!' : 'Transacción Rechazada'}
              </h1>
              <p className="text-gray-500 text-sm md:text-[15px] leading-relaxed mx-auto max-w-[90%] font-jostRegular">
                {isSuccess 
                  ? '¡Gracias por tu compra! Los tokens se acreditarán en tu cuenta dentro de un período de tiempo. Por favor, ten paciencia.'
                  : 'Lamentamos que tu transacción no se haya podido completar. Por favor, revisa la información y vuelve a intentarlo, o ponte en contacto con tu banco para obtener más detalles.'
                }
              </p>
            </div>

            {/* Transaction Details - List layout for both success and error */}
            <div className="border-t border-[#e0e0e0] mb-8 text-sm">
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Estado:</span>
                <span className={`font-jostBold ${isSuccess ? 'text-custom-marca-boton-variante2' : 'text-[#222222]'}`}>
                  {infoPay.response}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Motivo:</span>
                <span className="text-[#222222] font-jostBold">{infoPay.reason}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Referencia:</span>
                <span className="text-[#222222] font-jostBold uppercase">{infoPay.reference}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Banco:</span>
                <span className="text-[#222222] font-jostBold">{infoPay.bank}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Fecha:</span>
                <span className="text-[#222222] font-jostBold text-right">{formatDate(infoPay.date)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Recibo:</span>
                <span className="text-[#222222] font-jostBold uppercase">{infoPay.receiptOfPayment}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Respuesta:</span>
                <span className="text-[#222222] font-jostBold">{infoPay.response}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0]">
                <span className="text-[#666666] font-jostBold">Total:</span>
                <span className="text-[#222222] font-jostBold text-lg">{infoPay.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`mt-6 ${isSuccess ? '' : 'flex flex-col sm:flex-row gap-4 justify-center items-center'}`}>
              {isSuccess ? (
                <Link href={'/wallet'}>
                  <button 
                    className="w-full h-[50px] rounded-xl bg-gradient-to-r from-custom-marca-boton-variante2 to-custom-marca-boton text-white font-jostBold text-lg shadow-lg hover:shadow-xl hover:brightness-105 transition-all duration-300 flex justify-center items-center gap-2 group"
                  >
                    Ver mi billetera
                    <svg 
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                </Link>
              ) : (
                <>
                  <Link href={'/projects'}>
                    <button className="w-full sm:w-auto min-w-[180px] px-8 py-3 bg-custom-marca-boton-variante2 hover:bg-opacity-90 text-white font-jostBold rounded-full transition duration-200 shadow-md">
                      Intentar de Nuevo
                    </button>
                  </Link>
                  <Link href={'/contact'}>
                    <button className="w-full sm:w-auto min-w-[180px] px-8 py-3 bg-transparent border-2 border-custom-marca-boton text-custom-marca-boton font-jostBold rounded-full hover:bg-custom-marca-boton hover:text-white transition duration-200">
                      Contactar Soporte
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayResponsePage;
PayResponsePage.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { req, query } = context;
  const { ref_payco = '' } = query;

  // Validar que ref_payco esté presente
  if (!ref_payco) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Obtener datos de Epayco
  try {
    const response = await fetch(
      `https://secure.epayco.co/validation/v1/reference/${ref_payco}`
    );
    const data = await response.json();

    if (!data.success) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const info = data.data;
    let infoPay;

    // Mapear los datos de Epayco a nuestro formato
    infoPay = {
      date: info.x_transaction_date || '',
      response: info.x_respuesta || '',
      reference: info.x_id_invoice || '',
      reason: info.x_response_reason_text || '',
      receiptOfPayment: info.x_transaction_id || '',
      bank: info.x_bank_name || '',
      total: (info.x_amount ? info.x_amount.toString() : '0') + ' ' + (info.x_currency_code || 'COP'),
      statusCode: info.x_cod_response || '',
    };

    return {
      props: {
        infoPay: infoPay,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}
