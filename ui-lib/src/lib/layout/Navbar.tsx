import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import ButtonProfileNavbar from '../buttons/ButtonProfileNavbar';
import { TailSpin } from 'react-loader-spinner';
import dynamic from 'next/dynamic';
const ModalDeleteWallet = dynamic(() => import('../modals/ModalDeleteWallet'));
const ModalProfileUser = dynamic(() => import('../modals/ModalProfileUser'));

interface NavbarProps {
  walletInfo: any;
}
export default function Navbar(props: NavbarProps) {
  const { walletInfo } = props;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showprofile, setShowProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalDeleteWallet, setShowModalDeleteWallet] = useState(false);
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
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
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

  return (
    <>
      <nav className="fixed top-0 z-40 w-full bg-custom-fondo shadow-[rgba(221,222,227,1)_1px_1px_4px_0px]">
        <div className="relative px-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center justify-start">
              <button
                onClick={toggleSidebar}
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
              </button>
            </div>
            {/* {showCardanoWallet && (
              <div className="flex items-center ml-3">
                <CardanoWallet />
              </div>
            )} */}
            <div className="flex items-center">
              {!showprofile && (
                <div className="h-10 flex gap-4 items-center justify-center text-sm font-normal focus:z-10 focus:outline-none text-gray-900 dark:text-white dark:border-gray-600 rounded-lg  py-8 px-4">
                  <TailSpin width="20" color="#0e7490" />
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
