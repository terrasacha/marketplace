/* import { useWallet, useWalletList } from '@meshsdk/react'; */
import { Modal, Spinner } from 'flowbite-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AlertMessage from '../common/AlertMessage';
import Link from 'next/link';
import { Lucid, Blockfrost } from 'lucid-cardano';

const WALLET_ICONS: any = {
  eternl: '/images/help/eternl-wallet.png',
  nami: '/images/help/nami-wallet.png',
  gerowallet: '/images/help/gero-wallet.ico',
};

export default function SelectWalletModal({ openModal, setOpenModal }: any) {
  /* const { connected, connect, connecting, error } = useWallet(); */
  const connecting = false;
  const [walletSelected, setWalletSelected] = useState<string | undefined>(
    undefined
  );
  const [showError, setShowError] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: string;
    title: string;
    message: string;
    visible: boolean | unknown;
  }>({
    type: '',
    title: '',
    message: '',
    visible: false,
  });

  const getInstalledWallet = () => {
    if (window === undefined) return [];
    if (window.cardano === undefined) return [];

    let wallets: any = [];
    for (const key in window.cardano) {
      try {
        const _wallet = window.cardano[key];
        if (_wallet === undefined) continue;
        if (_wallet.name === undefined) continue;
        if (_wallet.icon === undefined) continue;
        if (_wallet.apiVersion === undefined) continue;
        wallets.push({
          api: _wallet,
          id: key,
          name: key == 'nufiSnap' ? 'MetaMask' : _wallet.name,
          icon: _wallet.icon,
          version: _wallet.apiVersion,
        });
      } catch (e) {}
    }
    console.log(window.cardano);
    console.log(wallets);

    return wallets;
  };

  const connectWallet = async (walletApi: any) => {
    const wallet = await walletApi.enable();
    console.log('Connected to wallet:', wallet);

    const lucid = await Lucid.new(
      new Blockfrost(
        'https://cardano-preview.blockfrost.io/api/v0',
        process.env['NEXT_PUBLIC_blockFrostKeysPreview']
      ),
      'Preview'
    );

    lucid.selectWallet(wallet);

    const address = await lucid.wallet.address();

    console.log('address', address);
    return wallet;
  };

  const wallets = getInstalledWallet();
  /* useEffect(() => {
    if (connected) {
      setOpenModal(undefined);
    }
  }, [connected]); */

  /* useEffect(() => {
    if (error) {
      setShowError(true);
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message:
          'Algo fallo al intentar conectar la billetera, revisa <a href="/help/createwallet#error-section" class="underline">aquí</a> los pasos para conectar una billetera.',
        visible: true,
      });
      setTimeout(() => {
        setShowError(false);
        setAlertMessage({
          type: '',
          title: '',
          message: '',
          visible: false,
        });
      }, 8000);
    }
  }, [error]);
 */
  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getWalletImageByName(walletName: string) {
    const keys = Object.keys(WALLET_ICONS);

    if (keys.includes(walletName.toLowerCase())) {
      return WALLET_ICONS[walletName.toLowerCase()];
    } else {
      return '';
    }
  }

  return (
    <Modal
      show={openModal === 'selectWalletModal'}
      onClose={() => setOpenModal(undefined)}
      size="md"
      className="z-40"
    >
      <Modal.Header className="py-3">Conectar Billetera</Modal.Header>
      {
        <Modal.Body className="p-6">
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {wallets.length > 0
              ? 'Conecta tú billetera con alguno de nuestros proveedores disponibles.'
              : 'No encontramos ninguna wallet instalada en tu navegador.'}
          </p>
          <ul className="my-4 space-y-3">
            {wallets.map((wallet: any) => {
              return (
                <li key={wallet.name}>
                  <a
                    onClick={() => {
                      connectWallet(wallet.api);
                      setWalletSelected(wallet.name);
                      sessionStorage.setItem(
                        'preferredWalletSuan',
                        wallet.name
                      );
                    }}
                    className="flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                  >
                    <Image
                      src={getWalletImageByName(wallet.name)}
                      alt={wallet.name}
                      width={25}
                      height={25}
                    />
                    <span className="flex-1 ml-3 whitespace-nowrap">
                      {capitalizeFirstLetter(wallet.name)}
                    </span>
                    {connecting && walletSelected === wallet.name && (
                      <Spinner aria-label="Default status example" />
                    )}
                    {showError &&
                      !connecting &&
                      walletSelected === wallet.name && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-red-500 bg-red-200 rounded dark:bg-red-700 dark:text-red-400">
                          Error
                        </span>
                      )}
                  </a>
                </li>
              );
            })}
          </ul>
          <AlertMessage
            type={alertMessage.type}
            title={alertMessage.title}
            message={alertMessage.message}
            visible={alertMessage.visible && showError}
          ></AlertMessage>
          <div className="mt-2">
            <Link
              href="https://suan-1.gitbook.io/documentacion-suan-sandbox"
              target="_blank"
              className="text-xs font-semibold hover:text-blue-400"
              onClick={() => setOpenModal(undefined)}
            >
              ¿Cómo creo mi billetera?
            </Link>
          </div>
        </Modal.Body>
      }
    </Modal>
  );
}
