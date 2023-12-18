import React, { useEffect, useState, useContext } from 'react';
import { Spinner } from 'flowbite-react';
import { FaRegCopy, FaCopy } from 'react-icons/fa6';
import { IoCloseSharp } from 'react-icons/io5';
import NewWalletContext from '../../store/generate-new-wallet-context';

const WordsContainer = (props: any) => {
  const {
    words,
    loading,
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(NewWalletContext);
  const useCase = props.useCase;
  const [wordsFormatted, setWordsFormatted] = useState(null) as any[];
  const [copied, setCopied] = useState(false) as any[];
  useEffect(() => {
    if (words === null) return;
    setWordsFormatted(words.split(' '));
  }, [words]);

  const removeRecoveryWord = (index: number) => {
    const recoveryWordsCopy = [...recoveryWords];
    recoveryWordsCopy[index] = '';
    setRecoveryWords(recoveryWordsCopy);
    setNextRecoveryWordIndex(recoveryWordsCopy.indexOf(''));
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(words);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 100);
  };
  return wordsFormatted === null ? (
    <div className="w-full bg-slate-600 h-24 rounded-xl flex justify-center items-center">
      <p className="text-white">
        {!loading ? (
          'Aquí podrás ver las palabras generadas'
        ) : (
          <Spinner aria-label="Spinner button example" size="lg" />
        )}
      </p>
    </div>
  ) : (
    <div className="relative w-full bg-slate-600 h-auto rounded-xl">
      {useCase === 'generate' && (
        <button
          onClick={() => copyToClipboard()}
          className="absolute right-4 top-4 text-white text-lg"
        >
          {copied ? <FaCopy /> : <FaRegCopy />}
        </button>
      )}
      <div className="grid grid-cols-3 gap-x-5 gap-y-4 px-8 py-8">
        {useCase === 'generate' &&
          wordsFormatted.map((word: string, index: number) => {
            return (
              <div
                className="w-full relative text-center border-b-2 border-gray-400  text-lg font-semibold"
                key={index}
              >
                <p className="absolute left-2 text-gray-400">{index + 1}</p>
                <p className="text-white">{word}</p>
              </div>
            );
          })}
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
