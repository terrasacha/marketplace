import { useEffect, useRef } from "react";

const url = "https://checkout.epayco.co/checkout.js";

interface EpaycoConfig {
  key: String;
  test?: boolean;
}

interface Epayco {
  checkout: {
    configure(options: any): any;
  };
  open(data: any): any;
}
/**
 *
 */
export const useEpayco = (config: EpaycoConfig) => {
  const epaycoRef = useRef<Epayco>();

  useEffect(() => {
    const script = document.createElement("script");

    script.src = url;
    script.async = true;

    script.onload = () => {
      if (!epaycoRef.current) {
        // @ts-ignore
        epaycoRef.current = ePayco.checkout.configure(config);
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [config]);

  return epaycoRef.current;
};

export default useEpayco;