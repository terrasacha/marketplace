import Script from 'next/script';
import React, { useEffect, useRef } from 'react';

interface CheckoutData {
  amount: string;
  currency: string;
  tokenName: string;
  tokenQuantity: string;
  invoiceID: string;
}
const EpaycoCheckout = (props: CheckoutData) => {
  const { amount, currency, tokenName, tokenQuantity, invoiceID } = props;

  const finalAmount = String(parseFloat(amount) * parseInt(tokenQuantity));

  // Creamos una referencia para el elemento que queremos simular el clic
  const pagoRef = useRef<any>(null);

  useEffect(() => {
    let btnpay = document.getElementsByClassName('epayco-button-render');
    setTimeout(() => {
      btnpay[0].setAttribute('id', 'pago');

      if (pagoRef.current) {
        pagoRef.current.click();
        console.log('hizo click');
      }
    }, 100);
  }, []);

  return (
    <>
      <label htmlFor="pago" ref={pagoRef}></label>
      <form>
        <Script
          src={'https://checkout.epayco.co/checkout.js'}
          data-epayco-key={'5757aeabf36a4a11058a10ca1d4265ac'}
          data-epayco-private-key={'39e44462e5aaf8bd8e92fd550eb0ffbe'}
          className="epayco-button"
          data-epayco-invoice={invoiceID}
          data-epayco-amount={finalAmount}
          //data-epayco-tax-ico="0"
          //data-epayco-tax="0"
          //data-epayco-tax-base={'0'}
          data-epayco-name="Compra de tokens"
          data-epayco-description={`(${tokenQuantity}) Token: ${tokenName}`}
          data-epayco-currency={currency.toLocaleLowerCase()}
          data-epayco-country="CO"
          data-epayco-test="true"
          data-epayco-external="true"
          data-epayco-response={`${process.env.NEXT_PUBLIC_HOST}/pay-response`}
          data-epayco-confirmation={`${process.env.NEXT_PUBLIC_HOST}/api/calls/backend/updatePayment`}
          data-epayco-button="https://multimedia.epayco.co/dashboard/btns/btn3.png"
          data-epayco-methodconfirmation="POST"
          //data-epayco-type-doc-billing={'CC'}
          //data-epayco-number-doc-billing={123456789}
          //data-epayco-name-billing={'Neider Smith Narvaez'}
          //data-epayco-mobilephone-billing={3124567891}
        />
      </form>
    </>
  );
};

export default EpaycoCheckout;
