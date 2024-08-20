// components/LoginForm.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'sonner';

export interface ConfirmCodeProps {
  logo: string;
  widthLogo: number;
  heightLogo: number;
  appName: string;
  confirmSignUpAuth: any;
  handleResendCode: any;
}
const initialStateErrors = { usernameError: '' };
const initialStateloginForm = { username: '' };
const initialState = {
  username: '',
  confirmationCode: '',
};
const ConfirmCode = (props: ConfirmCodeProps) => {
  const {
    logo,
    widthLogo,
    heightLogo,
    appName,
    confirmSignUpAuth,
    handleResendCode,
  } = props;
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<any>(initialStateloginForm);
  const [errors, setErrors] = useState<any>(initialStateErrors);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, seetConfirmationCode] = useState<any>(initialState);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    seetConfirmationCode((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitFromConfirmationCode = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await confirmSignUpAuth(confirmationCode);
      console.log(data, 'confirmSignUpAuth')
      if (data) {
        router.push('/auth/login');
      }
    } catch (error: any) {
      setErrors((preForm: any) => ({
        ...preForm,
        loginError: 'Código inválido',
      }));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!confirmationCode.username) {
      return toast.info(
        'Ingresa tu nombre de usuario para poder enviar el código.'
      );
    }
    try {
      await handleResendCode(confirmationCode.username);
      toast.success('Código enviado.');
    } catch (error) {
      toast.error('Error al enviar el código.');
    }
  };

  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <div className="w-full flex justify-center mb-8">
        <Image
          src={logo}
          width={widthLogo}
          height={heightLogo}
          alt={appName + ' Logo'}
        />
      </div>
      <>
        <h2 className="font-jostBold text-3xl font-normal pb-2">Código de confirmación</h2>
        <h4 className="font-jostRegular text-1xl font-normal">Ingrese código de confirmación</h4>
        <p
          className={`${
            errors.loginError === '' && 'hidden'
          } text-red-400 text-xs`}
        >
          {errors.loginError}
        </p>
        <form className="pt-10" onSubmit={(e) => submitFromConfirmationCode(e)}>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              value={confirmationCode.username}
              name="username"
              onChange={handleChange}
              className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label className="font-jostRegular peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Username
            </label>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              disabled={confirmationCode.username.length < 1}
              value={confirmationCode.confirmationCode}
              name="confirmationCode"
              onChange={handleChange}
              className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label className="font-jostRegular peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Código
            </label>
          </div>
        </form>

        <button
          type="button"
          onClick={(e) => submitFromConfirmationCode(e)}
          className={`font-jostBold relative flex items-center justify-center h-10 text-white ${
            loginForm.username.length > 0
              ? 'bg-custom-marca-boton  hover:bg-custom-marca-boton-variante'
              : 'bg-custom-marca-boton  hover:bg-custom-marca-boton-variante'
          } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
        >
          {loading ? (
            <TailSpin
              width="20"
              color="#fff"
              wrapperClass="font-jostRegular absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            'Confirmar código'
          )}
        </button>
        <button
       className={`relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2`}
          onClick={() => resendCode()}
        >
          Reenviar código
        </button>
      </>
    </div>
  );
};

export default ConfirmCode;
