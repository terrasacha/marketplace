import dynamic from "next/dynamic";
import { useState } from "react";
import Sidebar from "./Sidebar"; 

const CardanoWallet = dynamic(() => import("./cardano-wallet/CardanoWallet"));

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
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
            <div className="flex items-center">
              <div className="flex items-center ml-3">
                <CardanoWallet />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
}
