import Script from 'next/script';
import React, { useEffect, useRef } from 'react';

interface CheckoutData {
  amount: string;
  currency: string;
  tokenName: string;
  tokenQuantity: string;
  invoiceID: string;
}
export default function EpaycoCheckout(props: CheckoutData){
  const { amount, currency, tokenName, tokenQuantity, invoiceID } = props;

  // Calcular el monto total y redondearlo a entero (sin decimales) para Epayco
  // Epayco requiere montos enteros, especialmente para COP
  const totalAmount = parseFloat(amount) * parseInt(tokenQuantity);
  const finalAmount = String(Math.round(totalAmount));

  // Creamos una referencia para el elemento que queremos simular el clic
  const pagoRef = useRef<any>(null);

  useEffect(() => {
    const checkAndSetButton = () => {
      const btnpay = document.getElementsByClassName('epayco-button-render');
      
      if (btnpay && btnpay.length > 0 && btnpay[0]) {
        btnpay[0].setAttribute('id', 'pago');

        if (pagoRef.current) {
          pagoRef.current.click();
          console.log('hizo click');
        }
        return true;
      }
      return false;
    };

    // Intentar múltiples veces con intervalos en caso de que el script aún no haya cargado
    const intervalId = setInterval(() => {
      if (checkAndSetButton()) {
        clearInterval(intervalId);
      }
    }, 100);

    // Limpiar el intervalo después de 5 segundos como máximo
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <label htmlFor="pago" ref={pagoRef}></label>
      <form>
        <Script
          src={'https://checkout.epayco.co/checkout.js'}
          data-epayco-key={'71e8b0476df1c936056b373317001494'}
          data-epayco-private-key={'95ac9ef5c27dc5644295b7545b1ded80'}
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

