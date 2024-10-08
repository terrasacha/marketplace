import Link from 'next/link';
import { MyPage } from '@terrasacha/components/common/types';
import { XIcon } from '@marketplaces/ui-lib/src/lib/icons/XIcon';
import { CheckIcon } from '@marketplaces/ui-lib/src/lib/icons/CheckIcon'
// const responses = {
//   1: 'transacción aceptada',
//   2: 'transacción rechazada',
//   3: 'transacción pendiente',
//   4: 'transacción fallida'
// }

const PayResponsePage: MyPage = (props: any) => {
  const { infoPay } = props;
  console.log(infoPay);
  return (
    <div className="h-auto w-full p-5">
      {infoPay && (
        <div className="flex justify-center">
          <div className="w-[650px] bg-custom-dark text-custom-fondo rounded-xl p-5 space-y-4">
            <section className="flex justify-center">
              <h3 className="text-xl"> Respuesta de la Transacción </h3>
            </section>
            <section className="flex justify-center">
              {infoPay.response == 'Aceptada' &&
              infoPay.reason == 'Aprobada' ? (
                <span className="inline-flex items-center justify-center w-20 h-20 me-2 text-sm font-semibold text-custom-dark bg-custom-fondo rounded-full">
                  <CheckIcon className="h-20 w-20"></CheckIcon>
                  <span className="sr-only">Icon description</span>
                </span>
              ) : (
                <XIcon className="h-5 w-5"></XIcon>
              )}
            </section>
            <section className="flex flex-col bg-custom-fondo text-custom-dark rounded-xl p-5 text-xl">
              <div className="flex justify-between">
                <label>Referencia</label>
                <p id="referencia">{infoPay.reference}</p>
              </div>
              <div className="flex justify-between">
                <label>Fecha</label>
                <p id="fecha">{infoPay.date}</p>
              </div>
              <div className="flex justify-between">
                <label>Respuesta</label>
                <p id="respuesta">{infoPay.response}</p>
              </div>
              <div className="flex justify-between">
                <label>Motivo</label>
                <p id="motivo">{infoPay.reason}</p>
              </div>
              <div className="flex justify-between">
                <label>Banco</label>
                <p className="" id="banco">
                  {infoPay.bank}
                </p>
              </div>
              <div className="flex justify-between">
                <label>Recibo</label>
                <p id="recibo">{infoPay.receiptOfPayment}</p>
              </div>
              <div className="flex justify-between">
                <label>Total</label>
                <p className="" id="total">
                  {infoPay.total}
                </p>
              </div>
            </section>
            <section>
              <p className="">
                Gracias por tu compra. Los tokens se acreditarán en tu cuenta
                dentro de un período de tiempo. Por favor, ten paciencia
              </p>
            </section>
            <section className="ButtonResponse">
              <Link href={'/wallet'}>
                <button className="flex justify-center w-full text-custom-dark bg-custom-fondo hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded px-5 py-2.5">
                  Ver mi billetera
                </button>
              </Link>
            </section>
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
  console.log(ref_payco);
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

  infoPay = {
    date: info.x_transaction_date,
    response: info.x_respuesta,
    reference: info.x_id_invoice,
    reason: info.x_response_reason_text,
    receiptOfPayment: info.x_transaction_id,
    bank: info.x_bank_name,
    total: info.x_amount.toString() + ' ' + info.x_currency_code,
  };

  return {
    props: {
      infoPay: infoPay,
    },
  };
}
