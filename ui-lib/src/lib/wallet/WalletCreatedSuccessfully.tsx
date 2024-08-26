import React, { useEffect } from 'react';
//@ts-ignore
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useRouter } from 'next/router';
const WalletCreatedSucessfully = (props: any) => {
  const router = useRouter();
  const setCurrentSection = props.setCurrentSection;
  const [countdown, setCountdown] = React.useState(5);
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);
  useEffect(() => {
    if (countdown > 0) {
      const intervalId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
    countdown === 0 && router.push('/');
  }, [countdown]);

  const triggerConfetti = () => {
    confetti({
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(50, 100),
      origin: { y: 0.6 },
    });
  };
  const randomInRange = (min: any, max: any) => {
    return Math.random() * (max - min) + min;
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <h4 className="text-center text-4xl font-jostBold">¡Felicidades!</h4>
        <button
          className="flex justify-center text-[15rem] transition-transform transform active:scale-95"
          onClick={() => triggerConfetti()}
        >
          🥳
        </button>
        <p className="text-lg font-jostRegular">Tu billetera fue creada exitosamente</p>
        <div>
          {countdown > 0 ? (
            <p className="text-sm font-jostItalic">Redirigiendo en {countdown}</p>
          ) : (
            <p className="text-sm font-jostItalic">Redirigiendo...</p>
          )}
        </div>
      </div>
      <div className="flex w-full justify-end mt-6">
        <Link
          href="/"
                       className="group flex h-min items-center justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 ml-4"
        >
          Continuar
        </Link>
      </div>
    </div>
  );
};

export default WalletCreatedSucessfully;
