import React, { useState, useContext } from 'react';
import { Button } from 'flowbite-react';
import { FaPen } from 'react-icons/fa';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import NewWalletContext from '../../store/generate-new-wallet-context';
import { set } from 'lodash';

const deafultState = { walletname: '', password: '', passwordConfirm: '' };
const deafultStateShowInfo = { password: false, passwordConfirm: false };
const CreateCredentials = (props: any) => {
  const { setWalletInfo } = useContext<any>(NewWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState(deafultState) as any[];
  const [showInfo, setShowInfo] = useState(deafultStateShowInfo) as any[];
  const [errors, setErrors] = useState(deafultState) as any[];

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(deafultState);
    setInputValue({
      ...inputValue,
      [event.target.name]: event.target.value,
    });
  };
  const handleShowInfo = (name: string) => {
    setShowInfo({
      ...showInfo,
      [name]: !showInfo[name],
    });
  };
  const checkifPasswordMatch = () => {
    if (
      inputValue.password === inputValue.passwordConfirm &&
      inputValue.password.length > 5 &&
      inputValue.passwordConfirm.length > 5
    ) {
      return true;
    } else {
      return false;
    }
  };
  const handleContinue = () => {
    if (inputValue.walletname.length < 5) {
      setErrors({
        ...errors,
        walletname:
          'El nombre de la billetera debe tener al menos 5 caracteres',
      });
      return;
    }
    if (inputValue.password.length < 8) {
      setErrors({
        ...errors,
        password: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }
    if (!checkifPasswordMatch()) {
      setErrors({
        ...errors,
        passwordConfirm: 'Las contraseñas no coinciden',
      });
      return;
    }
    setWalletInfo({ name: inputValue.walletname, passwd: inputValue.password });
    return setCurrentSection(2);
  };
  return (
    <div>
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-semibold">Crea tu billetera de Cardano</h2>
      </section>
      <label className="font-semibold text-slate-600">
        Nombre de la billetera{' '}
        <span className="font-light text-xs text-red-500">
          {errors.walletname}
        </span>
      </label>
      <div className="relative w-full mt-2">
        <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Ejemplo: Mi billetera de Cardano"
          name="walletname"
          value={inputValue.walletname}
          onChange={(e) => handleInputChange(e)}
          className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
            errors.walletname.length > 0
              ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
              : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
          }`}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4 mt-6">
        <div>
          <label className="font-semibold text-slate-600">
            Introduzca la nueva contraseña
          </label>
          <div className="relative w-full mt-2">
            <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showInfo.password ? 'text' : 'password'}
              name="password"
              value={inputValue.password}
              placeholder="Introduzca una contraseña"
              onChange={(e) => handleInputChange(e)}
              className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
                errors.password.length > 0
                  ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
                  : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
              }`}
            />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => handleShowInfo('password')}
            >
              {showInfo.password ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
            </button>
          </div>
          <p className="font-light text-red-500 text-sm">{errors.password}</p>
        </div>
        <div>
          <label className="font-semibold text-slate-600">
            Repita la nueva contraseña
          </label>
          <div className="relative w-full mt-2">
            <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showInfo.passwordConfirm ? 'text' : 'password'}
              placeholder="Repetir contraseña"
              value={inputValue.passwordConfirm}
              name="passwordConfirm"
              onChange={(e) => handleInputChange(e)}
              className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
                errors.passwordConfirm.length > 0
                  ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
                  : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
              }`}
            />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => handleShowInfo('passwordConfirm')}
            >
              {showInfo.passwordConfirm ? (
                <BsFillEyeFill />
              ) : (
                <BsFillEyeSlashFill />
              )}
            </button>
          </div>
          <p className="font-light text-red-500 text-xs">
            {errors.passwordConfirm}
          </p>
        </div>
      </div>
      <div className="flex w-full justify-end mt-6">
        <Button
          className="px-8"
          color="gray"
          onClick={() => setInputValue(deafultState)}
        >
          Limpiar todos los campos
        </Button>
        <Button className="px-8 ml-4" onClick={() => handleContinue()}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default CreateCredentials;
