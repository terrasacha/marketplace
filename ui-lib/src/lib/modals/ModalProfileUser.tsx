import React, { useState, useRef, useEffect, useContext } from 'react';
import { useQRCode } from 'next-qrcode';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import colorByLetter from '@marketplaces/utils-2/src/lib/dicc';
import CardanoWallet from '../cardano-wallet/CardanoWallet';
import { WalletOffIcon } from '../icons/WalletOffIcon';
import WalletContext from '@marketplaces/utils-2/src/lib/context/wallet-context';
/* import { useWallet } from '@meshsdk/react'; */
interface ModalProfileUserProps {
  closeModal: () => void;
  openDeleteModal: () => void;
  walletInfo: any;
}
const ModalProfileUser = (props: ModalProfileUserProps) => {
  const { handleClearData, walletID } = useContext<any>(WalletContext);
  /* const { disconnect } = useWallet(); */

  const { closeModal, walletInfo, openDeleteModal } = props;
  const { Canvas } = useQRCode();
  const [copied, setCopied] = useState<boolean>(false);
  const router = useRouter();
  const walletChar = walletInfo.name.charAt(0).toUpperCase();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      //@ts-ignore
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, closeModal]);

  
  const clearAllCaches = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('/api/transactions/account-tx')) {
        localStorage.removeItem(key);
      }
    });
  };

  const copyToClipboard = (data: string) => {
    navigator.clipboard.writeText(data).then(
      () => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.log('failed to copy', err.message);
      }
    );
  };
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
    <div
      ref={modalRef}
      className="animate-fade-left animate-duration-200 animate-ease-in absolute bottom-[-.2rem] right-0 w-[22rem] flex items-center justify-center z-40"
    >
      <div className={`${colors.fuenteAlterna}  z-50 w-full bg-white dark:bg-gray-800 rounded-md shadow-2xl absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full overflow-hidden pb-3`}>
        <div className="w-full bg-[#e7eaf5] py-4 px-3 flex gap-4 items-start">
          <div
            // @ts-ignore
            className={`relative ${colorByLetter[walletChar]} text-white font-normal rounded-lg w-10 h-10`}
          >
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {walletInfo.name.charAt(0).toUpperCase() || ''}
            </p>
          </div>
          {!copied ? (
            <p
              className="text-xs font-normal text-gray-500 w-3/5  break-words text-left pt-2 cursor-pointer"
              onClick={() => copyToClipboard(walletInfo.addr)}
            >
              {`${walletInfo.addr.slice(0, 20)}...${walletInfo.addr.slice(
                -10
              )}` || ''}
            </p>
          ) : (
            <p className="text-xs font-semibold text-emerald-600 w-3/5  break-words text-left pt-2 cursor-pointer animate-fade animate-infinite animate-ease-out animate-alternate animate-duration-1000">
              Address copiada
            </p>
          )}
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => closeModal()}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="w-full flex flex-col items-center justify-center pb-4 pt-2">
          <Canvas
            text={`${walletInfo.addr}` || 'loading'}
            options={{
              errorCorrectionLevel: 'M',
              margin: 5,
              scale: 6,
              width: 150,
              color: {
                dark: '#1e293b',
                light: '#fff',
              },
            }}
          />
          <p className="text-xxs text-[#1e293b] text-center w-5/6  pb-8">
            Scan this code with multisig wallet mobile app to sign Transaction
            with mobile device
          </p>
          {!walletInfo.externalWallet ? (
            <button
              onClick={() => {
                window.sessionStorage.removeItem('hasTokenAuth');
                signOut()
                  .then(() => router.push('/'))
                  .then(() => handleClearData());
              }}
              className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-2 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
            >
              <WalletOffIcon className="mr-2 h-5 w-5"></WalletOffIcon>
              Desconectar
            </button>
          ) : (
            <CardanoWallet />
          )}
          <button
            onClick={() => {
              openDeleteModal();
              closeModal();
            }}
            className="text-xs text-red-500 mt-3 cursor-pointer"
          >
            Eliminar wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProfileUser;
