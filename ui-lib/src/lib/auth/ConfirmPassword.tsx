// components/LoginForm.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export interface ConfirmPasswordProps {
  logo: string;
  widthLogo: number;
  heightLogo: number;
  appName: string;
  forgotPasswordSubmit: any;
  forgotPassword: any;
}
const initialStateErrors = { usernameError: '' };
const initialStateloginForm = { username: '' };
const initialStateLoginFormRecovery = {
  username: '',
  confirmationCode: '',
  newPassword: '',
};
const ConfirmPassword = (props: ConfirmPasswordProps) => {
  const {
    logo,
    widthLogo,
    heightLogo,
    appName,
    forgotPassword,
    forgotPasswordSubmit,
  } = props;
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<any>(initialStateloginForm);
  const [errors, setErrors] = useState<any>(initialStateErrors);
  const [loginFormRecovery, setLoginFormRecovery] = useState<any>(
    initialStateLoginFormRecovery
  );
  const [actualStep, setActualStep] = useState<number>(1);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setLoginForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const handleChangeRecovery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setLoginFormRecovery((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitForm = async (event: any) => {
    event.preventDefault();
    forgotPassword(loginForm)
      .then((data: any) => {
        if (data) {
          setActualStep(2);
        }
      })
      .catch((error: any) => {
        setErrors((preForm: any) => ({
          ...preForm,
          loginError: error.name,
        }));
      });
  };
  const submitFormRecovery = async (event: any) => {
    event.preventDefault();
    forgotPasswordSubmit(loginFormRecovery)
      .then((data: any) => {
        if (data) {
          router.push('/auth/login');
        }
      })
      .catch((error: any) => {
        setErrors((preForm: any) => ({
          ...preForm,
          loginError: error.name,
        }));
      });
  };
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <div className="w-full flex justify-center mb-8">
        <Image
          src={logo}
          width={widthLogo}
          height={heightLogo}
          alt={`${appName} Logo`}
        />
      </div>
      {actualStep === 1 && (
        <>
          <h2 className="text-3xl font-normal pb-2">Recuperar contraseña</h2>
          <h4 className="text-1xl font-normal">Ingrese sus datos</h4>
          <p
            className={`${
              errors.loginError === '' && 'hidden'
            } text-red-400 text-xs`}
          >
            {errors.loginError}
          </p>
          <form className="pt-10" onSubmit={(e) => submitForm(e)}>
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="text"
                value={loginForm.username}
                name="username"
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Username
              </label>
            </div>
          </form>
          <button
            type="submit"
            onClick={(e) => submitForm(e)}
            className={`text-white ${
              loginForm.username.length > 0
                ? 'bg-gray-800 hover:bg-gray-900'
                : 'bg-gray-500 hover:bg-gray-600'
            } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
          >
            Recuperar
          </button>
        </>
      )}
      {actualStep === 2 && (
        <>
          <h2 className="text-3xl font-normal pb-2">Recuperar contraseña</h2>
          <h4 className="text-1xl font-normal">Ingrese sus datos</h4>
          <p
            className={`${
              errors.loginError === '' && 'hidden'
            } text-red-400 text-xs`}
          >
            {errors.loginError}
          </p>
          <form className="pt-10" onSubmit={(e) => submitFormRecovery(e)}>
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="text"
                value={loginFormRecovery.confirmationCode}
                name="confirmationCode"
                onChange={handleChangeRecovery}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Código de verificación
              </label>
            </div>
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="text"
                value={loginFormRecovery.username}
                name="username"
                onChange={handleChangeRecovery}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Username
              </label>
            </div>
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="password"
                value={loginFormRecovery.newPassword}
                name="newPassword"
                onChange={handleChangeRecovery}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Nueva contraseña
              </label>
            </div>
          </form>
          <button
            type="button"
            onClick={(e) => submitFormRecovery(e)}
            className={`text-white ${
              loginForm.username.length > 0
                ? 'bg-gray-800 hover:bg-gray-900'
                : 'bg-gray-500 hover:bg-gray-600'
            } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
          >
            Recuperar
          </button>
        </>
      )}
    </div>
  );
};

export default ConfirmPassword;
