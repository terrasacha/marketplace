import { useWallet, useWalletList } from "@meshsdk/react";
import { Modal, Spinner } from "flowbite-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AlertMessage from "../common/AlertMessage";
import Link from "next/link";

const WALLET_ICONS: any = {
  eternl: "/images/help/eternl-wallet.png",
  nami: "/images/help/nami-wallet.png",
  gerowallet: "/images/help/gero-wallet.ico",
};

export default function SelectWalletModal({ openModal, setOpenModal }: any) {
  const { connected, connect, connecting, error } = useWallet();
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
    type: "",
    title: "",
    message: "",
    visible: false,
  });

  const wallets = useWalletList();
  useEffect(() => {
    if (connected) {
      setOpenModal(undefined);
    }
  }, [connected]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      setAlertMessage({
        type: "failure",
        title: "Error !",
        message:
          'Algo fallo al intentar conectar la billetera, revisa <a href="/help/createwallet#error-section" class="underline">aquí</a> los pasos para conectar una billetera.',
        visible: true,
      });
      setTimeout(() => {
        setShowError(false);
        setAlertMessage({
          type: "",
          title: "",
          message: "",
          visible: false,
        });
      }, 8000);
    }
  }, [error]);

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getWalletImageByName(walletName: string) {
    const keys = Object.keys(WALLET_ICONS);

    if (keys.includes(walletName.toLowerCase())) {
      return WALLET_ICONS[walletName.toLowerCase()];
    } else {
      return "";
    }
  }

  return (
    <Modal
      show={openModal === "selectWalletModal"}
      onClose={() => setOpenModal(undefined)}
      size="md"
    >
      <Modal.Header className="py-3">Conectar Billetera</Modal.Header>
      <Modal.Body className="p-6">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          { wallets.length > 0 ? "Conecta tú billetera con alguno de nuestros proveedores disponibles." : "No encontramos ninguna wallet instalada en tu navegador."}
        </p>
        <ul className="my-4 space-y-3">
          {wallets.map((wallet) => {
            return (
              <li key={wallet.name}>
                <a
                  onClick={() => {
                    connect(wallet.name);
                    setWalletSelected(wallet.name);
                    sessionStorage.setItem('preferredWalletSuan', wallet.name)
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
            target='_blank'
            className="text-xs font-semibold hover:text-blue-400"
            onClick={() => setOpenModal(undefined)}
          >
            ¿Cómo creo mi billetera?
          </Link>
        </div>
      </Modal.Body>
    </Modal>
  );
}
