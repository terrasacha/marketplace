import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { TailSpin } from 'react-loader-spinner';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';

const initialStateErrors = { loginError: '' };

export interface LoginFormProps {
  logo: string;
  widthLogo: number;
  heightLogo: number;
  signInAuth: any;
  poweredby: boolean;
  appName: string;
}
const deafultStateShowInfo = { password: false };
const LoginForm = (props: LoginFormProps) => {
  const { logo, widthLogo, heightLogo, appName, poweredby } = props;
  const { signInAuth } = props;
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<any>({
    username: '',
    password: '',
  });
  const [showInfo, setShowInfo] = useState(deafultStateShowInfo) as any[];
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>(initialStateErrors);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setLoginForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const handleShowInfo = (e : any, name: string) => {
    e.preventDefault()
    setShowInfo({
      ...showInfo,
      [name]: !showInfo[name],
    });
  };
  const submitForm = async () => {
    setLoading(true);
    try {
      const data = await signInAuth(loginForm);
      console.log(data, "loginform")
      if(data.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'){
        return router.push(`/auth/new-password-required?username=${loginForm.username}`);
      }
      if (data.isSignedIn) {
        console.log(data, "loginform")
        const isFromGenerateWallet = router.query.fromGenerateWallet === 'true';
        if (isFromGenerateWallet) return router.push('/generate-wallet');
        return router.push('/');
      }
    } catch (error: any) {
      console.log(error.name)
      if (error.name === 'UserNotFoundException') {
        setErrors((preForm: any) => ({
          ...preForm,
          loginError: 'El usuario no existe',
        }));
      } else if (error.name === 'NotAuthorizedException'){
        setErrors((preForm: any) => ({
          ...preForm,
          loginError: 'Contraseña inválida',
        }));
      }
      else if (error.name === 'EmptySignInUsername'){
        setErrors((preForm: any) => ({
          ...preForm,
          loginError: 'Debe ingresar datos',
        }));
      }
      else{
      setErrors((preForm: any) => ({
        ...preForm,
        loginError: 'error.name',
      }));
    }
    } finally {
      setLoading(false); // Se asegura de que setLoading(false) se ejecute, independientemente de si la promesa se resuelve o se rechaza.
    }
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
      <h2 className="font-jostBold text-3xl font-jostBold pb-3 flex justify-center text-center">¡Bienvenido al Marketplace de {appName}!</h2>
      <h4 className="font-jostRegular text-1xl font-jostRegular">Ingrese sus datos:</h4>
      <p
        className={`${
          errors.loginError === '' && 'hidden'
        } font-jostRegular text-red-400 text-xs`}
      >
        {errors.loginError}
      </p>
      <form className= "pt-10" onSubmit={(e) => e.preventDefault()}>
        <div className="relative z-0 w-full mb-4 group">
          <input
            type="text"
            value={loginForm.username}
            name="username"
            onChange={handleChange}
            className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-400 peer"
            placeholder="username"
            required
          />
        </div>
        <div className="relative z-0 w-full mb-4 group">
          <input
            type={showInfo.password ? 'text' : 'password'}
            value={loginForm.password}
            name="password"
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder="password"
            required
          />
          <button
            className="font-jostRegular absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={(e) => handleShowInfo(e, 'password')}
          >
            {showInfo.password ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
          </button>
          
        </div>
      </form>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          value=""
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="font-jostItalic ml-2 text-sm font-light text-gray-900 dark:text-gray-300">
          Mantener sesión iniciada
        </label>
      </div>
      <button
        type="button"
        onClick={() => submitForm()}
        className={`relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 py-2`}
      >
        {loading ? (
          <TailSpin
            width="20"
            color="#fff"
            wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          'Ingresar'
        )}
      </button>
      <p className="font-jostRegular text-sm pt-5">
        ¿No tienes una cuenta? {' '}
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
      <p className="font-jostRegular text-[#50A4FF] text-sm pt-2">
        <Link href={'/auth/forgot-password'} className="text-[#50A4FF] text-sm">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      {poweredby && (
        <div className="font-jostRegular flex items-center justify-center mt-4 text-xs">
          Powered by
          <Image
            src="/images/home-page/suan_logo.png"
            height={10}
            width={12}
            className="ml-2"
            alt={`${appName} logo`}
          />
        </div>
      )}
    </div>
  );
};
export default LoginForm;
