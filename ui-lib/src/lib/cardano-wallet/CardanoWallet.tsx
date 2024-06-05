import { useState, useContext } from 'react';
import { useWallet } from '@meshsdk/react';
import { WalletContext } from '@marketplaces/utils-2';

import WalletIcon  from '../icons/WalletIcon';
import { WalletOffIcon } from '../icons/WalletOffIcon';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const SelectWalletModal = dynamic(() => import('../modals/SelectWalletModal'));

export default function CardanoWallet() {
  const { connected, disconnect } = useWallet();
  const router = useRouter();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const { handleClearData } = useContext<any>(WalletContext);

  return (
    <>
      {!connected ? (
        //#2596be
        <button
          className="relative w-full flex font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2"
          onClick={() => setOpenModal('selectWalletModal')}
        >
          <WalletIcon className="mr-2 h-5 w-5"></WalletIcon>
          Conectar billetera
        </button>
      ) : (
        <button
          onClick={() => {
            disconnect();
            handleClearData();
            sessionStorage.removeItem('preferredWalletSuan');
            router.push('/');
          }}
          className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-2 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
        >
          <WalletOffIcon className="mr-2 h-5 w-5"></WalletOffIcon>
          Desconectar
        </button>
      )}
      <SelectWalletModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
}
