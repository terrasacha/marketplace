import React, { useState } from 'react';
import { RestoreWalletProvider } from '@marketplaces/ui-lib/src/lib/store/restore-wallet-context';
import CreateCredentials from './CreateCredentials';
import WalletCreatedSucessfully from '@marketplaces/ui-lib/src/lib/wallet/WalletCreatedSuccessfully';
import RetrieveWords from './RetrieveWords';

const RestoreWallet = (props: any) => {
  const [currentSection, setCurrentSection] = useState(1) as any[];
  return (
    <RestoreWalletProvider>
      <div className="bg-white rounded-2xl py-10 px-12 sm:px-8  flex flex-col justify-center">
        {currentSection === 1 && (
          <RetrieveWords setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 2 && (
          <CreateCredentials setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 3 && (
          <WalletCreatedSucessfully setCurrentSection={setCurrentSection} />
        )}
      </div>
    </RestoreWalletProvider>
  );
};

export default RestoreWallet;
