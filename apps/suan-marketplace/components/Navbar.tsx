import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { CardanoWallet } from '@marketplaces/ui-lib';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCardanoWallet, setShowCardanoWallet] = useState<any>(null);
  const [showprofile, setShowProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setShowCardanoWallet(false);
          setShowProfile(true);
        }
      } catch (error) {
        setShowCardanoWallet(true);
        setShowProfile(false);
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
    setShowModal(false);
  };

  return (
    <>
      <nav className="fixed top-0 z-40 w-full bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 lg:px-5 lg:pl-3 bg-white">
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
            {showCardanoWallet && (
              <div className="flex items-center ml-3">
                <CardanoWallet />
              </div>
            )}
            <div className="flex items-center">
              {showprofile && (
                <button
                  onClick={openModal}
                  className="relative h-10 flex gap-4 items-center justify-center text-sm font-normal focus:z-10 focus:outline-none text-gray-900 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 py-8 px-4"
                >
                  <div className="flex flex-col">
                    <p>My wallet</p>
                    <p className="font-light text-xs">addr...123</p>
                  </div>
                  <div className="relative bg-green-800 text-white font-normal rounded-lg w-10 h-10">
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      M
                    </p>
                  </div>
                  {showModal && (
                    <div className="absolute bottom-[-.2rem] right-0 w-80 flex items-center justify-center z-40">
                      <div className="z-50 w-full bg-white dark:bg-gray-800 rounded-md shadow-xl absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full overflow-hidden">
                        <div className="w-full bg-[#e7eaf5] py-4 px-3 flex gap-4 items-center">
                          <div className="relative bg-green-800 text-white font-normal rounded-lg w-10 h-10 ">
                            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              M
                            </p>
                          </div>
                          <p className="text-xs font-light text-gray-500 w-3/5  break-words text-left">
                            addraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                          </p>
                        </div>
                        <button
                          onClick={() => closeModal()}
                          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
