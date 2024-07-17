import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="es" translate="no">
      <Head>
        <script src="https://checkout.epayco.co/checkout.js"></script>
        <Script
        strategy='lazyOnload'
        src={`https://www.googletagmanager.com/gtag/js?id=G-PLQDT1KEHT`}
        />

        <Script id='' strategy='lazyOnload'>
          {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-PLQDT1KEHT', {
                page_path: window.location.pathname,
                });
            `}
        </Script>
      </Head>
      <body className="bg-[#fafbff]">
        <Main />
        <NextScript />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.6/flowbite.min.js"
          strategy="beforeInteractive"
        ></Script>
      </body>
    </Html>
  );
}
