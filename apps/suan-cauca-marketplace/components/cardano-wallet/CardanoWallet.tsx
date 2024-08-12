import { use, useContext, useState } from 'react';
/* import { useWallet } from '@meshsdk/react'; */
import { Button } from 'flowbite-react';
import { WalletIcon } from '../icons/WalletIcon';
import { WalletOffIcon } from '../icons/WalletOffIcon';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { WalletContext } from '@marketplaces/utils-2';

const SelectWalletModal = dynamic(() => import('../modals/SelectWalletModal'));

export default function CardanoWallet() {
/*   const { connected, disconnect } = useWallet(); */
  const { handleClearData } = useContext<any>(WalletContext);
  const router = useRouter();
  const [openModal, setOpenModal] = useState<string | undefined>();

  return (
    <>
    {/*   {!connected ? (
        <Button onClick={() => setOpenModal('selectWalletModal')}>
          <WalletIcon className="mr-2 h-5 w-5"></WalletIcon>
          Conectar billetera
        </Button>
      ) : (
        <Button
          onClick={() => {
            disconnect();
            handleClearData();
            sessionStorage.removeItem('preferredWalletSuan');
            router.push('/');
          }}
          color="failure"
          className="m3"
        >
          <WalletOffIcon className="mr-2 h-5 w-5"></WalletOffIcon>
          Desconectar
        </Button>
      )}
      <SelectWalletModal openModal={openModal} setOpenModal={setOpenModal} /> */}
    </>
  );
}
