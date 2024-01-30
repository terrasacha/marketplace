import { useWallet } from '@meshsdk/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { ChevronDownIcon, ScaleIcon, WalletIcon } from '../ui-lib';

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
  const router = useRouter();
  const { wallet, connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<any>(undefined);
  const [copied, setCopied] = useState(false);
  const [userBalance, setUserBalance] = useState<any | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [displayWalletOptions, setDisplayWalletOptions] = useState(false);

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
    const balance = await wallet.getBalance();
    const addresses = await wallet.getRewardAddresses();
    setWalletStakeID(addresses[0]);
    setUserBalance(balance[0]['quantity']);
  }

  function resetComponentState() {
    setWalletStakeID(undefined);
    setUserBalance(undefined);
  }

  function CopyWalletToClipboard() {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(walletStakeID).then(
        () => {
          setCopied(true);
          // changing back to default state after 2 seconds.
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        },
        (err) => {
          console.log('failed to copy', err.message);
        }
      );
    };
    const btnStyle = copied
      ? 'text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800'
      : 'text-gray-900 hover:text-white border border-gray-300 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800';
    const inputStyle = copied ? 'border-orange-400' : 'border-gray-300';
    /* if (connected && walletStakeID) { */
    return (
      <div>
        <label
          htmlFor="website-admin"
          className="block text-sm text-gray-500 dark:text-white"
        >
          Tu saldo
        </label>
        <h3 className="text-lg truncate">₳ {balance / 1000000 || '0'}</h3>
      </div>
    );
    /* } else {
      return (
        <div>
          <label
            htmlFor="website-admin"
            className="block text-sm text-gray-500 dark:text-white"
          >
            Tu saldo
          </label>
          <p>Billetera desconectada</p>
        </div>
      );
    } */
  }

  return (
    <aside
      ref={sidebarRef}
      id="logo-sidebar"
      className={`fixed top-0 left-0 z-40 w-80 h-screen transition-transform bg-white lg:translate-x-0 dark:bg-gray-800 dark:border-gray-700 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="relative h-screen px-5 pb-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center my-8">
          <Link href="/home">
            <Image
              src={image}
              height={heightLogo} //88 terra
              width={widthLogo} //120
              alt={`${appName} Logo`}
            />
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700"></div>
        {CopyWalletToClipboard()}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700"></div>

        <ul className="space-y-4 font-medium">
          <li>
            <button
              className="flex w-full items-center p-2 text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setDisplayWalletOptions(!displayWalletOptions)}
            >
              <WalletIcon />
              <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                Wallet
              </span>
              <ChevronDownIcon/>
            </button>
            <ul
              id="dropdown-example"
              className={`${!displayWalletOptions && 'hidden'} py-2 space-y-2`}
            >
              <li>
                <Link
                  href="/wallet"
                  className="flex items-center w-full p-2 transition duration-75 pl-11 group text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet/assets"
                  className="flex items-center w-full p-2 transition duration-75 pl-11 group text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Activos
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet/transactions"
                  className="flex items-center w-full p-2 transition duration-75 pl-11 group text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Transacciones
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet/send"
                  className="flex items-center w-full p-2 transition duration-75 pl-11 group text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="flex items-center p-2 text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-white"
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 21 21"
              >
                <g
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M9 4.025A7.5 7.5 0 1 0 16.975 12H9V4.025Z" />
                  <path d="M12.5 1c-.169 0-.334.014-.500.025V9h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 12.5 1Z" />
                </g>
              </svg>
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              onClick={onClose}
              href="/home"
              className="flex items-center p-2 text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ScaleIcon />
              <span className="flex-1 ml-3 whitespace-nowrap">Proyectos</span>
            </Link>
          </li>
        </ul>
        <ul
          className="space-y-4 font-medium"
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
              className="flex items-center p-2 text-gray-500 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                id="book"
              >
                <path d="M18,2H8A4,4,0,0,0,4,6V18a4,4,0,0,0,4,4H18a2,2,0,0,0,2-2V4A2,2,0,0,0,18,2ZM6,6A2,2,0,0,1,8,4H18V14H8a3.91,3.91,0,0,0-2,.56ZM8,20a2,2,0,0,1,0-4H18v4ZM10,8h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2Z"></path>
              </svg>
              <span className="flex-1 ml-3 whitespace-nowrap">Ayuda</span>
            </Link>
          </li>
          <li className="pt-4 mt-4 border-t text-xs font-light border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
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
