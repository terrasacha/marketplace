import React, { useEffect } from 'react';
//@ts-ignore
import confetti from 'canvas-confetti';
const WalletCreatedSucessfully = (props: any) => {
  const setCurrentSection = props.setCurrentSection;
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

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
        <h4 className="text-center text-4xl font-semibold">¡Felicidades!</h4>
        <button
          className="flex justify-center text-[15rem] transition-transform transform active:scale-95"
          onClick={() => triggerConfetti()}
        >
          🥳
        </button>
        <p className="text-lg">Tu billetera fue creada exitosamente</p>
      </div>
      <div className="flex w-full justify-end mt-6">
        <button className="group flex h-min items-center justify-center p-2 text-center font-medium focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 ml-4">
          Continuar
        </button>
      </div>
    </div>
  );
};

export default WalletCreatedSucessfully;
