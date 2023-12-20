import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Label, Button } from 'flowbite-react';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';
import NewWalletContext from '../../store/generate-new-wallet-context';
import WordsContainer from './WordsContainer';
const GenerateWordsStep = (props: any) => {
  const { words, setWords, loading, setLoading, user, walletInfo } =
    useContext<any>(NewWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (words === null) {
      generateWords();
    }
  }, []);
  const generateWords = async () => {
    const url =
      'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/sandbox/create-wallet/';
    const data = {
      walletName: walletInfo.name,
      save_flag: true,
      userID: user,
      isAdmin: false,
      isSelected: true,
      status: 'active',
      passphrase: walletInfo.passwd,
      size: 24,
    };
    axios
      .post(url, data)
      .then((response) => {
        setWords(response.data.data.mnemonic);
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
        <h2 className="text-2xl font-semibold">Generar palabras</h2>
      </section>
      <p className="pb-4 text-gray-500 text-sm">
        Las palabras que aparecen a continuación se denominan frase de
        recuperación. Le permiten restaurar y acceder a sus fondos en cualquier
        monedero Cardano. Por favor, escríbalas en papel en el en el orden
        indicado, y no las almacene en un servicio en línea.
      </p>

      <WordsContainer useCase="generate" />
      {words === null && (
        <div className="flex w-full justify-end mt-6">
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
          <div className="flex gap-2 mt-6">
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
          <div className="flex w-full justify-end mt-6">
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
