import { useWallet } from '@meshsdk/react';
import { useEffect, useState, useRef, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookIcon } from '../icons/BookIcon';
import { ChartIcon } from '../icons/ChartIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { MarketIcon } from '../icons/MarketIcon';
import { ScaleIcon } from '../icons/ScaleIcon';
import WalletIcon from '../icons/WalletIcon';
import { WalletContext } from '@marketplaces/utils-2';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  user: any;
  image: string;
  widthLogo: number;
  heightLogo: number;
  poweredBy: boolean;
  balance: any;
}

export default function Sidebar(props: SidebarProps) {
  const {
    isOpen,
    onClose,
    appName,
    image,
    widthLogo,
    heightLogo,
    poweredBy,
    balance,
  } = props;
  const { walletAdmin } = useContext<any>(WalletContext);
  const router = useRouter();
  const { wallet, connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<any>(undefined);
  const [copied, setCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [displayWalletOptions, setDisplayWalletOptions] = useState(false);
  const [displayMarketOptions, setDisplayMarketOptions] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (sidebarRef.current &&
          !sidebarRef.current.contains(event.target as Node)) ||
        (event.target instanceof HTMLAnchorElement &&
          event.target.closest('aside#logo-sidebar'))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (connected) {
      loadUserData();
    } else {
      resetComponentState();
    }
  }, [connected]);

  async function loadUserData() {
    const addresses = await wallet.getRewardAddresses();
    setWalletStakeID(addresses[0]);
  }

  function resetComponentState() {
    setWalletStakeID(undefined);
  }

  return (
    <aside
      ref={sidebarRef}
      id="logo-sidebar"
      className={`fixed top-0 left-0 z-40 w-80 h-screen transition-transform lg:translate-x-0  ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="relative h-screen px-5 pb-4 bg-custom-fondo shadow-[rgba(221,222,227,1)_1px_1px_4px_0px]">
        <div className="flex items-center justify-center py-8">
          <Link href="/home">
            <Image
              src={image}
              height={heightLogo} //88 terra
              width={widthLogo} //120
              alt={`${appName} Logo`}
            />
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200"></div>
        <div>
          <label htmlFor="website-admin" className="block text-sm text-black">
            Tu saldo
          </label>
          <h3 className="text-lg text-black truncate">₳ {balance}</h3>
        </div>
        <div className="pt-4 mt-4 border-t border-gray-200"></div>

        <ul className="space-y-4">
          <li className={walletAdmin ? '' : 'hidden'}>
            <Link
              onClick={onClose}
              href="/corewallet"
              className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
            >
              <ChartIcon />
              <span className="ml-3">CoreWallet</span>
            </Link>
          </li>
          <li className={connected ? 'hidden' : ''}>
            <button
              className="flex w-full items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
              onClick={() => setDisplayWalletOptions(!displayWalletOptions)}
            >
              <WalletIcon />
              <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                Billetera
              </span>
              <ChevronDownIcon />
            </button>
            <ul
              id="dropdown-example"
              className={`${
                !displayWalletOptions && 'hidden'
              } py-2 space-y-2 animate-fade animate-ease-in-out animate-duration-[400ms]`}
            >
              <li>
                <Link
                  href="/wallet"
                  className="flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
                >
                  Cuadro de mando
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet/assets"
                  className="flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
                >
                  Activos
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet/transactions"
                  className="flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
                >
                  Transacciones
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet/send"
                  className="flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
                >
                  Nueva transaccion
                </Link>
              </li>
            </ul>
          </li>
          <li className={connected ? '' : 'hidden'}>
            <Link
              onClick={onClose}
              href="/dashboard"
              className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
            >
              <ChartIcon />
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              onClick={onClose}
              href="/home"
              className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
            >
              <ScaleIcon />
              <span className="flex-1 ml-3 whitespace-nowrap">Proyectos</span>
            </Link>
          </li>

          <li className={connected ? 'hidden' : ''}>
            <Link
              onClick={onClose}
              href="/trade"
              className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
            >
              <MarketIcon />
              <span className="flex-1 ml-3 whitespace-nowrap">Mercado P2P</span>
            </Link>
          </li>
        </ul>
        <ul
          className="space-y-4"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
          }}
        >
          <li>
            <Link
              href="https://suan-1.gitbook.io/documentacion-suan-sandbox/"
              target="_blank"
              className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
            >
              <BookIcon />
              <span className="flex-1 ml-3 whitespace-nowrap">Ayuda</span>
            </Link>
          </li>
          <li className="pt-4 mt-4 border-t text-xs font-light border-gray-200 flex flex-col items-center justify-center text-center">
            {poweredBy && (
              <div className="flex items-center mt-2 mb-4">
                Powered by
                <Image
                  src="/images/home-page/suan_logo.png"
                  height={10}
                  width={12}
                  className="ml-1"
                  alt="SUAN Logo"
                />
              </div>
            )}
            <div>
              <p>Copyright © Derechos de autor</p>
              <p>Todos los derechos reservados</p>
              <p>Suan 2001-2023</p>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}
