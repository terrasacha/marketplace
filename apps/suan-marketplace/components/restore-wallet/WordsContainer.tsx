import React, { useEffect, useState, useContext } from 'react';
import { Spinner, Button } from 'flowbite-react';
import { FaRegCopy, FaCopy } from 'react-icons/fa6';
import { IoCloseSharp } from 'react-icons/io5';
import { RestoreWalletContext } from '@marketplaces/ui-lib';

const WordsContainer = (props: any) => {
  const {
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(RestoreWalletContext);
  const { useCase, loading, generateWords } = props;
  const [wordsFormatted, setWordsFormatted] = useState(null) as any[];
  const [copied, setCopied] = useState(false) as any[];
  useEffect(() => {
  }, []);

  const removeRecoveryWord = (index: number) => {
    const recoveryWordsCopy = [...recoveryWords];
    recoveryWordsCopy[index] = '';
    setRecoveryWords(recoveryWordsCopy);
    setNextRecoveryWordIndex(recoveryWordsCopy.indexOf(''));
  };

  return(
    <div className="relative w-full palabras-bg h-auto rounded-xl">
      <div className="grid grid-cols-3 gap-x-5 gap-y-4 px-8 py-8 palabras">
        {useCase === 'recovery' &&
          recoveryWords.map((word: string, index: number) => {
            return (
              <div
                className={`w-full relative text-center border-b-2  text-lg font-semibold ${
                  nextRecoveryWordIndex === index
                    ? 'border-white'
                    : 'border-gray-400'
                }`}
                key={index}
              >
                <p
                  className={`absolute left-2 text-gray-400 ${
                    nextRecoveryWordIndex === index
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </p>
                {word !== '' && (
                  <button
                    className="absolute right-2 top-1 text-gray-400"
                    onClick={() => removeRecoveryWord(index)}
                  >
                    <IoCloseSharp />
                  </button>
                )}
                <p className="text-white">{word || 'ㅤ'}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default WordsContainer;
