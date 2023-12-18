import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Label, Button } from 'flowbite-react';
import NewWalletContext from '../../store/generate-new-wallet-context';
import WordsContainer from './WordsContainer';
import { FaPen } from 'react-icons/fa';
import { set } from 'lodash';
const PasteWordsStep = (props: any) => {
  const {
    recoveryWords,
    words,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(NewWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState('') as any[];
  const [dictionary, setDictionary] = useState([]) as any[];
  const [errorInput, setErrorInput] = useState(false) as any[];
  useEffect(() => {
    setRecoveryWords(Array(24).fill(''));
    setNextRecoveryWordIndex(0);
    fetchDictionary();
  }, []);

  const fetchDictionary = async () => {
    const response = await fetch(
      'https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt'
    );
    const data = await response.text();
    setDictionary(data.split('\n'));
  };

  const updateRecoveryWords = (index: number, value: string, from: string) => {
    const saveWord = compareAndSaveWord(from, value);
    if (saveWord) {
      const updateRecoveryWords = [...recoveryWords];
      updateRecoveryWords[index] = saveWord;
      setRecoveryWords(updateRecoveryWords);
      setNextRecoveryWordIndex(updateRecoveryWords.indexOf(''));
      setInputValue('');
    }
  };
  const updateRecoveryWordsCopy = (copywords: string[]) => {
    const recoveryWordsCopy = [...recoveryWords];
    copywords.forEach((word, index) => {
      recoveryWordsCopy[index] = word;
    });
    if (words === recoveryWordsCopy.join(' ')) {
      setRecoveryWords(recoveryWordsCopy);
      setNextRecoveryWordIndex(recoveryWordsCopy.indexOf(''));
      setInputValue('');
    } else {
      console.log(`La frase de recuperación no coincide.`);
    }
  };

  const handleKeyDown = (e: any, index: number, value: string) => {
    if (e.key === 'Enter') {
      if (value.includes(' ')) {
        const copywords = value.split(' ');
        return updateRecoveryWordsCopy(copywords);
      }
      updateRecoveryWords(index, value, 'input');
    }
  };
  const compareAndSaveWord = (from: string, value: string) => {
    setErrorInput(false);
    let currentWord: any = null;
    let wordInDictionary = null;
    if (from === 'button') {
      currentWord = value;
      /* console.log(
        `button, currentWord: ${currentWord}, nextRecoveryWord: ${
          words.split(" ")[nextRecoveryWordIndex]
        }`
      ); */
      if (currentWord === words.split(' ')[nextRecoveryWordIndex]) {
        return words.split(' ')[nextRecoveryWordIndex];
      } else {
        setErrorInput(true);
        return false;
      }
    } else {
      currentWord = words.split(' ')[nextRecoveryWordIndex];
      wordInDictionary = dictionary.filter((word: string) =>
        word.includes(inputValue)
      );
      if (currentWord.includes(inputValue) && wordInDictionary.length === 1) {
        return wordInDictionary[0];
      } else {
        setErrorInput(true);
        return false;
      }
    }
  };

  return (
    <div>
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-semibold">Frase de recuperación</h2>
      </section>
      <p className="text-gray-500 text-sm">
        Introduzca la frase de seguridad de su cartera palabra por palabra.
        Asegúrate de introducir las palabras en el orden correcto.
      </p>
      <p className="pb-4 text-gray-500 text-sm">
        Asegúrate también de que nadie mira tu pantalla.
      </p>
      <WordsContainer useCase="recovery" />
      <p className="mt-6 w-full rounded-lg p-3 bg-slate-600 text-white  text-md font-semibold  py-2">
        Introduce caracteres para ver sugerecias de palabras.
      </p>
      <div className="relative w-full mt-2">
        <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={inputValue}
          disabled={nextRecoveryWordIndex === -1}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, nextRecoveryWordIndex, inputValue)}
          className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
            errorInput && inputValue.length > 0
              ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
              : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
          } `}
        />
      </div>
      <div className="grid grid-cols-5 gap-x-2 gap-y-2 py-4">
        {inputValue.length > 2 &&
          dictionary
            .filter((word: string) => word.includes(inputValue))
            .map((word: string, index: number) => {
              return (
                <button
                  key={index}
                  className="border border-slate-200 py-2 px-5 rounded-lg bg-slate-200 text-gray-600 font-semibold hover:border-gray-500"
                  onClick={() =>
                    updateRecoveryWords(nextRecoveryWordIndex, word, 'button')
                  }
                >
                  {word}
                </button>
              );
            })}
      </div>
      <div className="flex w-full justify-end mt-6">
        <Button
          className="px-8"
          color="gray"
          onClick={() => setCurrentSection(2)}
        >
          Vover
        </Button>
        <Button
          className="px-8 ml-4"
          disabled={recoveryWords.join(' ') !== words}
          onClick={() => setCurrentSection(3)}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default PasteWordsStep;
