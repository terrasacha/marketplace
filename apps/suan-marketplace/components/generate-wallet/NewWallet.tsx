import React, { useState } from 'react';
import GenerateWordsStep from './GenerateWordsStep';
import { NewWalletProvider } from '@suan/store/generate-new-wallet-context';
import PasteWordsStep from './PasteWordsStep';
import CreateCredentials from './CreateCredentials';
import WalletCreatedSucessfully from './WalletCreatedSuccessfully';

const NewWallet = (props: any) => {
  const [currentSection, setCurrentSection] = useState(1) as any[];
  return (
    <NewWalletProvider>
      <div className="bg-white rounded-2xl py-10 px-12 sm:px-8  flex flex-col justify-center">
        {currentSection === 1 && (
          <GenerateWordsStep setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 2 && (
          <PasteWordsStep setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 3 && (
          <CreateCredentials setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 4 && (
          <WalletCreatedSucessfully setCurrentSection={setCurrentSection} />
        )}
      </div>
    </NewWalletProvider>
  );
};

export default NewWallet;
