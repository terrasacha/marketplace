import { useEffect, useState, useContext } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import ButtonProfileNavbar from '../buttons/ButtonProfileNavbar';
import { TailSpin } from 'react-loader-spinner';
import dynamic from 'next/dynamic';
import { WalletContext } from '@marketplaces/utils-2';
import WalletSwitcherCard from './WalletSwitcherCard';
const ModalDeleteWallet = dynamic(() => import('../modals/ModalDeleteWallet'));
const ModalProfileUser = dynamic(() => import('../modals/ModalProfileUser'));

interface NavbarProps {
  walletInfo: any;
  handleSidebarStatus: () => void;
  isSidebarOpen?: boolean;
  balance?: any;
  balanceUSD?: number;
}
export default function Navbar(props: NavbarProps) {
  const { walletInfo, handleSidebarStatus, isSidebarOpen = false, balance, balanceUSD } = props;
  const { walletName, walletID, isLoading, walletAvailableBalance } = useContext<any>(WalletContext);
  const [showprofile, setShowProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalDeleteWallet, setShowModalDeleteWallet] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setShowProfile(true);
      } catch (error) {
        setShowProfile(true);
      }
    };

    fetchData();
  }, []);
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal((prevState) => !prevState);
  };
  const openDeleteModal = () => {
    setShowModalDeleteWallet(true);
  };

  const closeDeleteModal = () => {
    setShowModalDeleteWallet((prevState) => !prevState);
  };

  const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string; bgColorAlternativo: string; fuente: string; fuenteAlterna: string; }> = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente: 'font-jostBold',
      fuenteAlterna: 'font-jostRegular',
    },
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor: 'bg-custom-dark',
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente: 'font-semibold',
    fuenteAlterna: 'font-medium',
  };

  return (
    <>
      <nav className="fixed top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-lg">
        <div className="relative px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Sección izquierda: Toggle + Logo + Billetera */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Botón toggle sidebar - siempre visible */}
              <button
                onClick={handleSidebarStatus}
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2.5 text-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-custom-marca-boton-alterno2/10 hover:to-custom-marca-boton-alterno/10 hover:text-custom-marca-boton focus:outline-none focus:ring-2 focus:ring-custom-marca-boton/20 transition-all duration-300 group"
              >
                <span className="sr-only">Toggle sidebar</span>
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isSidebarOpen ? 'rotate-90' : ''}`}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Información de billetera - visible en desktop */}
              {walletName && (
                <div className="hidden lg:flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-custom-marca-boton-alterno2/10 to-custom-marca-boton-alterno/10 border border-custom-marca-boton/20 hover:border-custom-marca-boton/40 transition-all duration-300 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-custom-marca-boton/20 to-custom-marca-boton-alterno/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-jostRegular text-gray-500">Billetera</p>
                      <p className="text-sm font-jostBold text-gray-900 truncate max-w-[200px]">{walletName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección central: Saldo - visible en desktop */}
            {balance !== undefined && balanceUSD !== undefined && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-custom-marca-boton via-custom-marca-boton-variante to-custom-marca-boton-variante2 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex flex-col">
                      {showBalance ? (
                        <>
                          <p className="text-lg font-jostBold leading-tight">{balanceUSD.toFixed(2)} USD</p>
                          <p className="text-xs font-jostRegular text-white/80">{balance} ADA</p>
                        </>
                      ) : (
                        <p className="text-lg font-jostBold">****</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="ml-1 p-1 rounded hover:bg-white/20 transition-colors"
                      aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                    >
                      {showBalance ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sección derecha: Perfil */}
            <div className="flex items-center">
              {!showprofile && (
                <div className="h-10 flex gap-4 items-center justify-center text-sm font-normal focus:z-10 focus:outline-none text-gray-900 dark:text-white dark:border-gray-600 rounded-lg py-8 px-4">
                  <TailSpin width="20" color="#6e6c35" />
                </div>
              )}
              {showprofile && (
                <div className="relative">
                  <ButtonProfileNavbar
                    openModal={openModal}
                    showModal={showModal}
                    walletInfo={walletInfo}
                  />
                  {showModal && (
                    <ModalProfileUser
                      closeModal={closeModal}
                      openDeleteModal={openDeleteModal}
                      walletInfo={walletInfo}
                    />
                  )}
                  {showModalDeleteWallet && (
                    <ModalDeleteWallet
                      closeDeleteModal={closeDeleteModal}
                      walletInfo={walletInfo}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
