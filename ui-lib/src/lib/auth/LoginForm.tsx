import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
const initialStateErrors = { loginError: '' };

export interface LoginFormProps {
  logo: string;
  widthLogo: number;
  heightLogo: number;
  signInAuth: any;

  appName: string;
}
const LoginForm = (props: LoginFormProps) => {
  const { logo, widthLogo, heightLogo, appName } = props;
  const { signInAuth } = props;
  console.log('hola');
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<any>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<any>(initialStateErrors);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setLoginForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitForm = async () => {
    signInAuth(loginForm)
      .then((data: any) => {
        if (data) {
          const isFromGenerateWallet =
            router.query.fromGenerateWallet === 'true';
          if (isFromGenerateWallet) return router.push('/generate-wallet');
          return router.push('/');
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
      <h2 className="text-3xl font-normal pb-2">Bienvenido a {appName}</h2>
      <h4 className="text-1xl font-normal">Ingrese sus datos</h4>
      <p
        className={`${
          errors.loginError === '' && 'hidden'
        } text-red-400 text-xs`}
      >
        {errors.loginError}
      </p>
      <form className="pt-10">
        <div className="relative z-0 w-full mb-4 group">
          <input
            type="text"
            value={loginForm.username}
            name="username"
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-400 peer"
            placeholder="username"
            required
          />
        </div>
        <div className="relative z-0 w-full mb-4 group">
          <input
            type="password"
            value={loginForm.password}
            name="password"
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder="password"
            required
          />
        </div>
      </form>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          value=""
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ml-2 text-sm font-light text-gray-900 dark:text-gray-300">
          Mantener sesión iniciada
        </label>
      </div>
      <button
        type="button"
        onClick={() => submitForm()}
        className={`text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
      >
        Ingresar
      </button>
      <p className="text-sm pt-5">
        ¿No tienes una cuenta?
        <Link
          href={
            router.query.fromGenerateWallet === 'true'
              ? '/auth/signup?fromGenerateWallet=true'
              : '/auth/signup'
          }
          className="text-[#50A4FF] text-sm"
        >
          Ingresa aquí
        </Link>
      </p>
      <p className="text-[#50A4FF] text-sm pt-2">
        <Link href={'/auth/forgot-password'} className="text-[#50A4FF] text-sm">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </div>
  );
};
export default LoginForm;
