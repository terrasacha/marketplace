// components/LoginForm.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signUpAuth } from '@terrasacha/backend';
import { useRouter } from 'next/router';
import { Label, Select } from 'flowbite-react';

interface SignUpFormProps {
  handleSetSignUpStatus: (data: string) => void;
}
const initialStateErrors = { confirmPassword: '', createUserError: '' };

const SignUpForm: React.FC<SignUpFormProps> = ({ handleSetSignUpStatus }) => {
  const router = useRouter();
  const [signupForm, setSignupForm] = useState<any>({
    username: '',
    password: '',
    email: '',
    role: 'investor',
  });
  const [extraForm, setExtraForm] = useState<any>({ confirmPassword: '' });
  const [errors, setErrors] = useState<any>(initialStateErrors);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSignupForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const handleChangeExtraForm = (e: any) => {
    const { name, value } = e.target;
    setExtraForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitForm = async () => {
    setErrors(initialStateErrors);
    if (signupForm.password !== extraForm.confirmPassword) {
      return setErrors((preForm: any) => ({
        ...preForm,
        confirmPasswordError: 'Las contraseñas no coinciden',
      }));
    }
    signUpAuth(signupForm)
      .then((data) => handleSetSignUpStatus('confirmpassword'))
      .catch((error) => {
        if (error.name === 'UsernameExistsException') {
          return setErrors((preForm: any) => ({
            ...preForm,
            createUserError: 'El nombre de usuario ya existe',
          }));
        }
        if (error.name === 'InvalidPasswordException') {
          return setErrors((preForm: any) => ({
            ...preForm,
            createUserError: 'La contraseña debe tener al menos 8 caracteres',
          }));
        }
      });
  };
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <div className="w-full flex justify-center mb-8">
        <Image
          src="/images/home-page/suan-logo.png"
          width={200}
          height={20}
          className="h-20"
          alt="SUAN Logo"
        />
      </div>
      <h2 className="text-3xl font-normal pb-2">Regístrate</h2>
      <form className="pt-10 pb-5">
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            value={signupForm.username}
            name="username"
            onChange={handleChange}
            className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${
              errors.createUserError !== ''
                ? 'border-red-400'
                : 'border-gray-300'
            } appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
            placeholder=" "
            required
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Nombre de usuario
          </label>
          <p
            className={`${
              errors.createUserError === '' && 'hidden'
            } text-red-400 text-xs`}
          >
            {errors.createUserError}
          </p>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="email"
            value={signupForm.email}
            name="email"
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Email
          </label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="password"
            value={signupForm.password}
            name="password"
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Contraseña
          </label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="password"
            value={extraForm.ConfirmPassword}
            name="confirmPassword"
            onChange={handleChangeExtraForm}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Confirmar contraseña
          </label>
          <p className="text-xs text-red-400">{errors.confirmPasswordError}</p>
        </div>
        <div className="max-w-md">
          <div className="mb-2 block">
            <Label className="font-normal" value="Tipo de usuario" />
          </div>
          <Select name="role" value={signupForm.role} onChange={handleChange}>
            <option value="investor">Inversionista</option>
            <option value="constructor">Propietario</option>
          </Select>
        </div>
      </form>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
          className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ml-2 text-xs font-light text-gray-900 dark:text-gray-300">
          Acepto los{' '}
          <span className="text-blue-600">términos y condiciones</span>
        </label>
      </div>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={privacyAccepted}
          onChange={() => setPrivacyAccepted(!privacyAccepted)}
          className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ml-2 text-xs font-light text-gray-900 dark:text-gray-300">
          Acepto la{' '}
          <span className="text-blue-600">política de privacidad de datos</span>
        </label>
      </div>
      <button
        type="button"
        onClick={() => submitForm()}
        className={`text-white ${
          termsAccepted &&
          privacyAccepted &&
          signupForm.password.length > 0 &&
          signupForm.username.length &&
          signupForm.email.length &&
          extraForm.confirmPassword.length > 0
            ? 'bg-gray-800 hover:bg-gray-900'
            : 'bg-gray-500 hover:bg-gray-600'
        } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
        disabled={
          signupForm.password.length === 0 ||
          signupForm.username.length === 0 ||
          signupForm.email.length === 0 ||
          extraForm.confirmPassword.length === 0 ||
          !termsAccepted ||
          !privacyAccepted
        }
      >
        Registrarse
      </button>
      <p className="text-sm pt-1 w-full text-center">
        ¿Ya tienes una cuenta?
        <Link
          href={
            router.query.fromGenerateWallet === 'true'
              ? '/auth/login?fromGenerateWallet=true'
              : '/auth/login'
          }
          className="text-[#50A4FF] text-sm"
        >
          Ingresa aquí
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
