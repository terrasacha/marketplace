import { useState } from 'react';

interface DashboardItemToggleProps {
  icon: JSX.Element;
  values: any;
  label: string;
}

const DashboardItemToggle: React.FC<DashboardItemToggleProps> = ({
  icon,
  values,
  label,
}) => {
  const [switchCurrency, setSwitchCurrency] = useState<string>('COP');
  const [rotating, setRotating] = useState<boolean>(false);
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  const clickCoin = async () => {
    setRotating(true);
    await new Promise((resolve) => setTimeout(resolve, 750));
    // Cambia la moneda
    if (switchCurrency === 'COP') {
      setSwitchCurrency('USD');
    } else if (switchCurrency === 'USD') {
      setSwitchCurrency('COP');
    }
    setRotating(false);
    setFadeIn(true);
    setTimeout(() => {
      setFadeIn(false);
    }, 200);
  };

  return (
    <div className="bg-custom-fondo dark:bg-[#69a1b3] shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] rounded-md flex items-center justify-between p-4 dark:border-[#588695] text-custom-dark dark:text-gray-800 font-medium group">
      <div className="font-semibold">
        <p
          className={`text-custom-dark-hover text-2xl ${
            fadeIn ? 'animate-fade' : ''
          }`}
        >
          {`${values[switchCurrency]} ${switchCurrency}`}
        </p>
        <p>{label}</p>
      </div>
      <button
        className={`flex cursor-pointer justify-center items-center w-14 h-14 bg-custom-dark-hover dark:bg-white rounded-full ${
          rotating ? 'animate-rotate-x' : ''
        }`}
        onClick={() => clickCoin()}
      >
        {icon}
      </button>
    </div>
  );
};

export default DashboardItemToggle;
