import WordsContainer from '@terrasacha/components/generate-wallet/WordsContainer';
import React, { useContext, useState } from 'react';
import { Checkbox, Label, Button } from 'flowbite-react';
import GenerateWordsStep from './GenerateWordsStep';
import { NewWalletProvider } from '@terrasacha/store/generate-new-wallet-context';
import PasteWordsStep from './PasteWordsStep';
import CreateCredentials from './CreateCredentials';

const NewWallet = (props: any) => {
  const [currentSection, setCurrentSection] = useState(2) as any[];
  return (
    <NewWalletProvider>
      <div className="bg-white rounded-2xl py-10 px-12 sm:px-8  flex flex-col justify-center">
        {currentSection === 1 && (
          <CreateCredentials setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 2 && (
          <GenerateWordsStep setCurrentSection={setCurrentSection} />
        )}
        {currentSection === 3 && (
          <PasteWordsStep setCurrentSection={setCurrentSection} />
        )}
      </div>
    </NewWalletProvider>
  );
};

export default NewWallet;
