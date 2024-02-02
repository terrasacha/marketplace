import React, { useContext, useState, useEffect } from 'react';
import { Radio, Label, Button } from 'flowbite-react';
import {RestoreWalletContext} from '@marketplaces/ui-lib';
import WordsContainer from './WordsContainer';
import { FaPen } from 'react-icons/fa';

const options = [
  { id: 'twentyfour', value: 24, name: 'Veinticuatro' },
  { id: 'twentyone', value: 21, name: 'Veintiuno' },
  { id: 'eighteen', value: 18, name: 'Dieciocho' },
  { id: 'fifteen', value: 15, name: 'Quince' },
  { id: 'twelve', value: 12, name: 'Doce' },
];

const PasteWordsStep = (props: any) => {
  const {
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(RestoreWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState('') as any[];
  const [dictionary, setDictionary] = useState([]) as any[];
  const [errorInput, setErrorInput] = useState(false) as any[];
  useEffect(() => {
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

      setRecoveryWords(recoveryWordsCopy);
      setNextRecoveryWordIndex(copywords.length);
      setInputValue('');

  };

  const handleKeyDown = (e: any, index: number, value: string) => {
    if (e.key === 'Enter') {
      if (value.includes(' ')) {
        const copywords = value.split(' ');
        return updateRecoveryWordsCopy(copywords);
      }
      updateRecoveryWords(index, value, 'button');
    }
  };
  const compareAndSaveWord = (from: string, value: string) => {
    setErrorInput(false);
    let currentWord: any = null;
    let wordInDictionary = null;
    if (from === 'button') {
      currentWord = value;
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
    if (from === 'button2') {
        return value
    }
  };
  const changeWordsLength = (option:any) =>{
    setRecoveryWords(Array(option).fill(''))
    setNextRecoveryWordIndex(0)
  }
  return (
    <div>
      <section className="flex justify-between pb-2">
        <h2 className="w-full text-2xl font-semibold text-center">
          Palabras de Recuperación
        </h2>
      </section>
      
      <fieldset className="flex gap-2 mb-4">
        {options.map((option, index) => {
          return (
            <div className="flex items-center gap-2" key={index}>
              <Radio
                id={option.id}
                name="words"
                defaultChecked={option.value === 24}
                value={option.value}
                onClick={(e) => changeWordsLength(option.value)}
              />
              <Label htmlFor={option.id}>{option.value} palabras</Label>
            </div>
          );
        })}
      </fieldset>
      <WordsContainer useCase="recovery" />
      <p className="w-full rounded-lg p-3 bg-slate-600 text-white  text-md font-semibold  py-2">
        Empieza a escribir para ver sugerecias de palabras.
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
                    updateRecoveryWords(nextRecoveryWordIndex, word, 'button2')
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
          onClick={() => setCurrentSection(1)}
        >
          Vover
        </Button>
        <button
          className="group flex h-min items-center justify-center p-2 text-center font-medium focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 ml-4"
          disabled={recoveryWords.includes("")}
          onClick={() => setCurrentSection(2)}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default PasteWordsStep;
