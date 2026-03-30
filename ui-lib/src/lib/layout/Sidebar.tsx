/* import { useWallet } from '@meshsdk/react'; */
import { useEffect, useState, useRef, useContext } from 'react';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookIcon } from '../icons/BookIcon';
import { ChartIcon } from '../icons/ChartIcon';
import { MailIcon } from '../icons/MailIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { MarketIcon } from '../icons/MarketIcon';
import { ScaleIcon } from '../icons/ScaleIcon';
import WalletIcon from '../icons/WalletIcon';
import { WalletContext } from '@marketplaces/utils-2';
import { InfoIcon, LoadingIcon, SquareArrowUpIcon } from '../ui-lib';
import SideBarBalanceSkeleton from '../common/skeleton/SideBarBalanceSkeleton';
import WalletSwitcherCard from './WalletSwitcherCard';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useWallet } from '@meshsdk/react';
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
  balanceUSD: any
}

const getRates = async () => {
  const response = await fetch('/api/calls/getRates')
  const data = await response.json()
  let dataFormatted: any = {}
  data.map((item: any) => {
      let obj = `ADArate${item.currency}`
      dataFormatted[obj] = parseFloat(item.value.toFixed(4))
  });
  return dataFormatted
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
    balanceUSD
  } = props;
  const { walletAdmin, walletRole, isLoading, lastSyncDate, balanceChanged, walletAvailableBalance, walletLockedBalance } =
    useContext<any>(WalletContext);
  const router = useRouter();
  const { connected } = useWallet();
  const [walletStakeID, setWalletStakeID] = useState<any>(undefined);
  const [copied, setCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [displayWalletOptions, setDisplayWalletOptions] = useState(false);
  const [displayMarketOptions, setDisplayMarketOptions] = useState(false);
  const [syncedAgo, setSyncedAgo] = useState<number>(0);
  const [balanceChangeUSD, setBalanceChangeUSD] = useState<number>(0)
  const [changeOnBalanceDetected, setChangeOnBalanceDetected] =
    useState<boolean>(false);
  const [env, setEnv] = useState('')
  
  // Determinar si se permite acceso a CoreWallet basado en el role de la wallet
  const allowAccessCW = walletRole === 'core';
  
  useEffect(() =>{
    const env = process.env.NEXT_PUBLIC_ENV || ''
    setEnv(env)
  },[])
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

  /* useEffect(() => {
    if (connected) {
      loadUserData();
    } else {
      resetComponentState();
    }
  }, [connected]); */

  useEffect(() => {
    const playCashRegister = () => {
      var audio: any = document.getElementById('a1');
      audio.play();
    };

    if (balanceChanged !== 0) {
      getRates()
    .then(rates =>{
      //@ts-ignore
      setBalanceChangeUSD(Math.abs(((balanceChanged / 1000000) * rates.ADArateUSD).toFixed(4)))
      playCashRegister();
      setChangeOnBalanceDetected(true);

      setTimeout(() => {
        setChangeOnBalanceDetected(false);
      }, 4000);
    })
    }
  }, [balanceChanged]);

  useEffect(() => {
    // Fecha almacenada (ejemplo: 1 de julio de 2024)

    const calcularTiempo = () => {
      const fechaActual = Date.now();
      const diferencia = Math.floor((fechaActual - lastSyncDate) / 1000);

      setSyncedAgo(diferencia);
    };

    // Calcular el tiempo inmediatamente y luego cada segundo
    calcularTiempo();
    const intervalo = setInterval(calcularTiempo, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, [lastSyncDate]);
 /*  async function loadUserData() {
    const addresses = await wallet.getRewardAddresses();
    setWalletStakeID(addresses[0]);
  }

  function resetComponentState() {
    setWalletStakeID(undefined);
  } */
    const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
    const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
      Terrasacha: {
        bgColor: 'bg-custom-marca-boton',
        hoverBgColor: 'hover:bg-custom-marca-boton-variante',
        bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
        fuente:'font-jostBold',
        fuenteAlterna:'font-jostRegular',
      },
    
      // Agrega más marketplaces y colores aquí
    };
    const colors = marketplaceColors[marketplaceName] || {
      bgColor:  'bg-custom-dark' ,
      hoverBgColor: 'hover:bg-custom-dark-hover',
      bgColorAlternativo: 'bg-amber-400',
      fuente:'font-semibold',
      fuenteAlterna:'font-medium',
    };
  return (
    <aside
  ref={sidebarRef}
  id="logo-sidebar"
  className={`fixed top-0 left-0 z-50 w-80 h-screen transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } flex flex-col justify-between`}
>
  <audio id="a1" src="/sounds/cash-register.mp3"></audio>
  <div className="relative h-full px-5 pb-4 bg-gradient-to-br from-white via-gray-50 to-custom-marca-boton-alterno2/5 shadow-xl border-r border-gray-100/50 flex flex-col justify-between overflow-y-auto">
    {/* Efectos de fondo decorativos */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 right-0 w-64 h-64 bg-custom-marca-boton/5 rounded-full blur-3xl animate-float" style={{ top: '-50px', right: '-80px', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-custom-marca-boton-alterno/5 rounded-full blur-3xl animate-float" style={{ bottom: '-40px', left: '-60px', animationDelay: '1s' }}></div>
    </div> 
    <div className="relative z-10">
      <div className="flex items-center justify-center py-8 animate-fade-in">
        <Link href="/" className="group transition-transform hover:scale-105">
          <Image src={image} height={heightLogo} width={widthLogo} alt={`${appName} Logo`} className="transition-all duration-300" />
        </Link>
      </div>

      <div className="pt-4 border-t border-gray-200/50"></div>
      <div className="py-2">
        <WalletSwitcherCard onCloseSidebar={onClose} />
      </div>
      {balance ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 animate-scale-in">
          <label className={`${colors.fuenteAlterna} block text-sm font-semibold text-gray-500 mb-2`}>Tu saldo</label>
          <div>
            <p
              className={`text-2xl truncate font-jostBold mb-[-.1rem] bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent ${
                changeOnBalanceDetected
                  ? balanceChanged >= 0
                    ? 'balance-changed-positive'
                    : 'balance-changed-negative'
                  : ''
              }`}
            >
              {!isLoading ? (
                balanceUSD.toFixed(4)
              ) : (
                <span className="inline-flex items-center">
                  <LoadingIcon className="h-5 w-5" />
                </span>
              )}{' '}
              <span className={`${colors.fuenteAlterna} font-bold text-gray-500 text-base`}>USD</span>
              {changeOnBalanceDetected && (
                <>
                  <span className="inline-block animate-bounce ml-2 text-sm">
                    {'('}
                    {balanceChanged >= 0 ? '+ ' : '- '}
                    {balanceChangeUSD}
                    {')'}
                  </span>
                </>
              )}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-custom-marca-boton-alterno2/10 transition-all duration-300 group">
                <span className="text-sm font-jostRegular text-gray-600 group-hover:text-custom-marca-boton transition-colors">Total: </span>
                <div className="flex items-center gap-1">
                  {!isLoading ? (
                    <span className={`text-sm font-jostBold ${
                      changeOnBalanceDetected
                        ? balanceChanged >= 0
                          ? 'balance-changed-positive'
                          : 'balance-changed-negative'
                        : 'text-gray-900'
                    }`}>
                      {balance}
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <LoadingIcon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-gray-500 text-xs font-jostRegular">ADA</span>
                  {changeOnBalanceDetected && (
                    <span className="inline-block animate-bounce ml-1 text-xs">
                      {'('}
                      {balanceChanged >= 0 ? '+ ' : '- '}
                      {Math.abs(balanceChanged / 1000000)}
                      {')'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-custom-marca-boton-alterno2/10 transition-all duration-300 group">
                <div className="flex items-center gap-1">
                  <div className='inline' data-tooltip-id="available-tooltip" data-tooltip-content={`Cantidad de ADAs disponibles`}>
                    <InfoIcon className="h-4 w-4 inline text-gray-400 group-hover:text-custom-marca-boton transition-colors" />
                  </div>
                  <Tooltip id="available-tooltip" />
                  <span className="text-sm font-jostRegular text-gray-600 group-hover:text-custom-marca-boton transition-colors">Disponible: </span>
                </div>
                <div className="flex items-center gap-1">
                  {!isLoading ? (
                    <span className={`text-sm font-jostBold ${
                      changeOnBalanceDetected
                        ? balanceChanged >= 0
                          ? 'balance-changed-positive'
                          : 'balance-changed-negative'
                        : 'text-gray-900'
                    }`}>
                      {(walletAvailableBalance / 1000000).toFixed(4)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <LoadingIcon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-gray-500 text-xs font-jostRegular">ADA</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-custom-marca-boton-alterno2/10 transition-all duration-300 group">
                <div className="flex items-center gap-1">
                  <div className='inline' style={{zIndex: 1000}} data-tooltip-id="blocked-tooltip" data-tooltip-content={`En Cardano, cualquier token debe ir asociado a una cantidad de ADAs. Esta cantidad es la que se encuentra bloqueada para la billetera.`}>
                    <InfoIcon className="h-4 w-4 inline text-gray-400 group-hover:text-custom-marca-boton transition-colors" />
                  </div>
                  <Tooltip id="blocked-tooltip" style={{zIndex: 1000}}/>
                  <span className="text-sm font-jostRegular text-gray-600 group-hover:text-custom-marca-boton transition-colors">Bloqueado: </span>
                </div>
                <div className="flex items-center gap-1">
                  {!isLoading ? (
                    <span className={`text-sm font-jostBold ${
                      changeOnBalanceDetected
                        ? balanceChanged >= 0
                          ? 'balance-changed-positive'
                          : 'balance-changed-negative'
                        : 'text-gray-900'
                    }`}>
                      {(walletLockedBalance / 1000000).toFixed(4)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <LoadingIcon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-gray-500 text-xs font-jostRegular">ADA</span>
                </div>
              </div>
            </div>
            <label className={`${colors.fuenteAlterna} block text-xs font-light text-gray-500 pt-3 flex items-center gap-1`}>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Sincronizado hace {syncedAgo} segundos
            </label>
          </div>
        </div>
      ) : (
        <SideBarBalanceSkeleton />
      )}

      <div className="pt-4 mt-2 border-t border-gray-200/50"></div>
      <ul className="space-y-2">
        <li className="animate-fade-in">
        <div 
          data-tooltip-id="my-tooltip" 
          data-tooltip-content={`Ambiente de desarrollo: ${env}`} 
          className='relative py-1.5 px-4 bg-gradient-to-br from-custom-marca-boton via-custom-marca-boton-variante to-custom-marca-boton-variante2 rounded-lg text-white text-xs w-full text-center font-jostBold shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <span className="relative z-10">{env}</span>
        </div>
        <Tooltip id="my-tooltip" />
        </li>
        <li className={allowAccessCW ? 'animate-slide-up' : 'hidden'} style={{ animationDelay: '0.1s' }}>
          <Link
            onClick={onClose}
            href="/corewallet"
            className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton hover:to-custom-marca-boton-variante hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <ChartIcon />
            </div>
            <span className={`${colors.fuenteAlterna} ml-3 group-hover:font-jostBold transition-all`}>CoreWallet</span>
          </Link>
        </li>
        <li className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <button
            className="flex w-full items-center p-3 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton hover:to-custom-marca-boton-variante hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
            onClick={() => setDisplayWalletOptions(!displayWalletOptions)}
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <WalletIcon />
            </div>
            <span className={`${colors.fuenteAlterna} flex-1 ms-3 text-left rtl:text-right whitespace-nowrap group-hover:font-jostBold transition-all`}>Billetera</span>
            <div className={`transition-transform duration-300 ${displayWalletOptions ? 'rotate-180' : ''}`}>
              <ChevronDownIcon />
            </div>
          </button>
          <ul
            id="dropdown-example"
            className={`${
              !displayWalletOptions && 'hidden'
            } py-2 space-y-1 animate-fade animate-ease-in-out animate-duration-[400ms] ml-4 border-l-2 border-custom-marca-boton/20 pl-2`}
          >
            <li>
              <Link
                href="/wallet"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2.5 pl-8 group text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/20 hover:to-custom-marca-boton-alterno/10 hover:text-custom-marca-boton transition-all duration-300 relative`}
              >
                <span className="absolute left-0 w-1 h-0 bg-custom-marca-boton rounded-r-full group-hover:h-full transition-all duration-300"></span>
                Cuadro de mando
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/assets"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2.5 pl-8 group text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/20 hover:to-custom-marca-boton-alterno/10 hover:text-custom-marca-boton transition-all duration-300 relative`}
              >
                <span className="absolute left-0 w-1 h-0 bg-custom-marca-boton rounded-r-full group-hover:h-full transition-all duration-300"></span>
                Activos
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/transactions"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2.5 pl-8 group text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/20 hover:to-custom-marca-boton-alterno/10 hover:text-custom-marca-boton transition-all duration-300 relative`}
              >
                <span className="absolute left-0 w-1 h-0 bg-custom-marca-boton rounded-r-full group-hover:h-full transition-all duration-300"></span>
                Transacciones
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/send"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2.5 pl-8 group text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/20 hover:to-custom-marca-boton-alterno/10 hover:text-custom-marca-boton transition-all duration-300 relative`}
              >
                <span className="absolute left-0 w-1 h-0 bg-custom-marca-boton rounded-r-full group-hover:h-full transition-all duration-300"></span>
                Nueva transaccion
              </Link>
            </li>
          </ul>
        </li>
        <li className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            onClick={onClose}
            href="/"
            className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton hover:to-custom-marca-boton-variante hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <ScaleIcon />
            </div>
            <span className={`${colors.fuenteAlterna} flex-1 ml-3 whitespace-nowrap group-hover:font-jostBold transition-all`}>Proyectos</span>
          </Link>
        </li>

        <li className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <Link
            onClick={onClose}
            href="/trade"
            className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton hover:to-custom-marca-boton-variante hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <MarketIcon />
            </div>
            <span className={`${colors.fuenteAlterna} flex-1 ml-3 whitespace-nowrap group-hover:font-jostBold transition-all`}>Mercado P2P</span>
          </Link>
        </li>
        <li className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link
            onClick={onClose}
            href="/pqr"
            className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton hover:to-custom-marca-boton-variante hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <MailIcon />
            </div>
            <span className={`${colors.fuenteAlterna} flex-1 ml-3 whitespace-nowrap group-hover:font-jostBold transition-all`}>PQR</span>
          </Link>
        </li>
      </ul>
    </div>
    <div className="relative z-10">
      <ul className="space-y-2">
        <li className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <Link
            href="https://terrasacha.gitbook.io/terrasacha"
            target="_blank"
            className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton hover:to-custom-marca-boton-variante hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <BookIcon />
            </div>
            <span className={`${colors.fuenteAlterna} flex-1 ml-3 whitespace-nowrap group-hover:font-jostBold transition-all`}>Ayuda</span>
          </Link>
        </li>
        <li className="pt-4 mt-4 border-t text-xs font-light border-gray-200/50 flex flex-col items-center justify-center text-center animate-fade-in">
          {poweredBy && (
            <div className={`${colors.fuenteAlterna} flex items-center mt-2 mb-4 text-gray-500`}>
              Powered by
              <Image
                src="/v2/logoterrasacha.svg"
                height={80}
                width={92}
                className="ml-1 opacity-70"
                alt="SUAN Logo"
              />
            </div>
          )}
          <div className="text-gray-400">
            <p className={`${colors.fuenteAlterna}`}>Copyright © Derechos de autor</p>
            <p className={`${colors.fuenteAlterna}`}>Todos los derechos reservados</p>
            <p className={`${colors.fuenteAlterna}`}>Suan 2001-2023</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</aside>
  );
}
