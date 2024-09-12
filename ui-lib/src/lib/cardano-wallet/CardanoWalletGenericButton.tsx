import { useState } from 'react';
/* import { useWallet } from '@meshsdk/react'; */
import { useRouter } from 'next/router';
import { TailSpin } from 'react-loader-spinner';
import SelectWalletModal from '../modals/SelectWalletModal';
interface CardanoWalletProps {
  text: string;
  checkingWallet: string
}
export default function CardanoWalletGeneric(props: CardanoWalletProps) {
  const { text, checkingWallet } = props;
  /* const { connected, disconnect } = useWallet(); */
  const router = useRouter();
  const [openModal, setOpenModal] = useState<string | undefined>();

  return (
    <div>
      {/* <button
        className="relative flex h-10 w-full items-center justify-center p-0.5 text-sm font-normal focus:z-10 focus:outline-none text-gray-900 border border-gray-300 enabled:hover:bg-gray-100 focus:ring-cyan-300 :bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2 mt-2"
        onClick={() => setOpenModal('selectWalletModal')}
      >
        {!connected || checkingWallet === 'unauthorized' ? (
          text
        ) : (
          <TailSpin
            width="20"
            color="#e5e7eb"
            wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </button>
      <SelectWalletModal openModal={openModal} setOpenModal={setOpenModal} /> */}
    </div>
  );
}
