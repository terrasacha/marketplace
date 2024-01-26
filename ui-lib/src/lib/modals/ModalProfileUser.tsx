import React from 'react';
import { useQRCode } from 'next-qrcode';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { colorByLetter } from '@marketplaces/utils-2';
import { CardanoWallet } from '../ui-lib';
interface ModalProfileUserProps {
  closeModal: () => void;
  walletInfo: any;
}
const ModalProfileUser = (props: ModalProfileUserProps) => {
  const { closeModal, walletInfo } = props;
  const { Canvas } = useQRCode();
  const router = useRouter();
  const walletChar = walletInfo.name.charAt(0).toUpperCase();

  return (
    <div
      className="
      animate-fade-left animate-duration-200 animate-ease-in
    absolute bottom-[-.2rem] right-0 w-[22rem] flex items-center justify-center z-40"
    >
      <div className="z-50 w-full bg-white dark:bg-gray-800 rounded-md shadow-2xl absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full overflow-hidden pb-3">
        <div className="w-full bg-[#e7eaf5] py-4 px-3 flex gap-4 items-start">
          <div
            // @ts-ignore
            className={`relative ${colorByLetter[walletChar]} text-white font-normal rounded-lg w-10 h-10`}
          >
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {walletInfo.name.charAt(0).toUpperCase() || ''}
            </p>
          </div>
          <p className="text-xs font-normal text-gray-500 w-3/5  break-words text-left pt-2">
            {`${walletInfo.addr.slice(0, 20)}...${walletInfo.addr.slice(
              -10
            )}` || ''}
          </p>
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
                signOut();
                router.push('/');
              }}
              className="flex items-center text-start text-lg p-2 text-gray-500 rounded-lg dark:text-white  w-4/6"
            >
              <svg
                className="w-5 h-5 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                />
              </svg>
              <span className="flex-1 ml-2 whitespace-nowrap">Logout</span>
            </button>
          ) : (
            <CardanoWallet />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalProfileUser;
