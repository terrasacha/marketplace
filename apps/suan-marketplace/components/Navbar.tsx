import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { CardanoWallet } from '@marketplaces/ui-lib';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCardanoWallet, setShowCardanoWallet] = useState<any>(null);
  const [showprofile, setShowProfile] = useState<any>(null);
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

  return (
    <>
      <nav className="fixed top-0 z-40 w-full bg-[#fafbff] dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 lg:px-5 lg:pl-3 ">
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
            {showprofile && (
              <button className="relative flex h-10 items-center justify-center p-0.5 text-sm font-normal focus:z-10 focus:outline-none text-gray-900 border border-gray-300 enabled:hover:bg-gray-100 focus:ring-cyan-300 :bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-md focus:ring-2 py-2 px-8">
                Profile
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
