import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Label, Button, Radio } from 'flowbite-react';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';
import NewWalletContext from '@suan//store/generate-new-wallet-context';
import WordsContainer from './WordsContainer';

const options = [
  { id: 'twentyfour', value: 24, name: 'Veinticuatro' },
  { id: 'twentyone', value: 21, name: 'Veintiuno' },
  { id: 'eighteen', value: 18, name: 'Dieciocho' },
  { id: 'fifteen', value: 15, name: 'Quince' },
  { id: 'twelve', value: 12, name: 'Doce' },
];
const GenerateWordsStep = (props: any) => {
  const {
    words,
    setWords,
    loading,
    setLoading,
    user,
    walletInfo,
    recoveryWords,
    setRecoveryWords,
  } = useContext<any>(NewWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    /* if (words === null) {
      generateWords();
    } */
  }, []);
  const generateWords = async () => {
    const url =
      'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/wallet/create-wallet/';
    const data = {
      walletName: walletInfo.name || 'test',
      save_flag: true,
      userID: user,
      isAdmin: false,
      isSelected: true,
      status: 'active',
      passphrase: walletInfo.passwd || 'test12341234',
      size: recoveryWords.length,
    };
    axios
      .post(url, data)
      .then((response) => {
        setWords(response.data.data.mnemonic);
        console.log(response.data.data.mnemonic);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al hacer la solicitud:', error);
        setLoading(false);
      });
  };
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  return (
    <div>
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-semibold text-center w-full">
          Palabras de Recuperación
        </h2>
      </section>
      <p className="pb-4 text-gray-500 text-sm">
        Las palabras que aparecen a continuación se denominan frase de
        recuperación. Le permiten restaurar y acceder a sus fondos en cualquier
        monedero Cardano. Por favor, escríbalas en papel en el en el orden
        indicado, y no las almacene en un servicio en línea.
      </p>
      <section className="flex justify-between pb-2">
        <h2 className="text- font-normal">Cantidad de palabras</h2>
      </section>
      <p className="pb-4 text-gray-500 text-sm">
        Selecciona la cantidad de palabras que deseas generar para recuperar tu
        billetera
      </p>
      <fieldset className="flex gap-2 mb-4">
        {options.map((option, index) => {
          return (
            <div className="flex items-center gap-2" key={index}>
              <Radio
                id={option.id}
                name="words"
                defaultChecked={option.value === 24}
                value={option.value}
                onClick={(e) => setRecoveryWords(Array(option.value).fill(''))}
              />
              <Label htmlFor={option.id}>{option.value} palabras</Label>
            </div>
          );
        })}
      </fieldset>
      <WordsContainer useCase="generate" generateWords={generateWords} />
      {words === null && (
        <div className="flex w-full justify-end mt-3 ">
          <Button
            className="px-8 ml-4"
            onClick={() => setCurrentSection(1)}
            color="gray"
          >
            Volver
          </Button>
        </div>
      )}
      {words !== null && (
        <>
          <div className="flex gap-2 mt-3 important_words">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              viewBox="0 -960 960 960"
              width="45"
            >
              <path d="M440-440h80v-200h-80v200Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
            </svg>
            <p className="pb-4 text-sm text-black">
              Estas palabras le permitirán restaurar y acceder a sus fondos en
              cualquier monedero Cardano. Por favor, escríbalas en papel en el
              en el orden indicado, y no las almacene en un servicio en línea.
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex h-5 items-center">
              <Checkbox
                id="alreadycopy"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="shipping">
                He copiado las palabras y las he guardado en un lugar seguro
              </Label>
            </div>
          </div>
          <div className="flex w-full justify-end mt-3">
            <Button
              className="px-8 ml-4"
              disabled={!isChecked}
              onClick={() => setCurrentSection(3)}
            >
              Continuar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default GenerateWordsStep;
