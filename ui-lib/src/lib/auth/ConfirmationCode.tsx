// components/LoginForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
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

const initialStateErrors = { usernameError: '', loginError: '' };
const initialState = {
  username: '',
  confirmationCode: '',
};

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
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
  const emailFromQuery = getQueryValue(router.query.email);
  const usernameFromQuery = getQueryValue(router.query.username);

  const [errors, setErrors] = useState<any>(initialStateErrors);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<any>(initialState);
  const [knownUsername, setKnownUsername] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    const fromSession =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('pendingConfirmUsername') || ''
        : '';

    const resolvedKnownUsername = usernameFromQuery || fromSession;

    if (resolvedKnownUsername) {
      setKnownUsername(resolvedKnownUsername);
      setConfirmationCode((prevForm: any) => ({
        ...prevForm,
        username: resolvedKnownUsername,
      }));
    }
  }, [router.isReady, usernameFromQuery]);

  const hasKnownUsername = Boolean(knownUsername);
  const resolvedUsername = confirmationCode.username.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setConfirmationCode((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const submitFromConfirmationCode = async (event: any) => {
    event.preventDefault();

    if (!resolvedUsername) {
      toast.info(
        <span className="font-jostRegular text-lg">
          No se pudo identificar el usuario. Vuelve a registrarte o inicia sesión.
        </span>
      );
      return;
    }

    if (!confirmationCode.confirmationCode?.trim()) {
      toast.info(
        <span className="font-jostRegular text-lg">
          Ingresa el código de confirmación enviado a tu correo.
        </span>
      );
      return;
    }

    setLoading(true);
    try {
      const pendingPassword =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('pendingConfirmPassword') || ''
          : '';

      const data = await confirmSignUpAuth({
        username: resolvedUsername,
        confirmationCode: confirmationCode.confirmationCode.trim(),
        password: pendingPassword || undefined,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingConfirmUsername');
        sessionStorage.removeItem('pendingConfirmEmail');
        sessionStorage.removeItem('pendingConfirmPassword');
      }

      if (data?.isSignedIn) {
        toast.success('Cuenta confirmada. Accediendo a la plataforma...', {
          className: 'font-custom text-lg',
        });
        return router.replace('/wallets');
      }

      // Confirmación ok, pero no se pudo abrir sesión automáticamente
      toast.success('Cuenta confirmada. Inicia sesión para continuar.', {
        className: 'font-custom text-lg',
      });
      router.push('/auth/login');
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
    if (!resolvedUsername) {
      return toast.info(
        <span className="font-jostRegular text-lg">
          No se pudo identificar el usuario para reenviar el código.
        </span>
      );
    }
    try {
      await handleResendCode(resolvedUsername);
      toast.success('Código enviado.', {
        className: 'font-custom text-lg',
      });
    } catch (error: any) {
      let msg = 'Error al enviar el código';
      if (error.name === 'UserNotFoundException') {
        msg = 'El usuario no existe';
      }
      if (error.name === 'LimitExceededException') {
        msg = 'Cantidad de envíos excedido. Intente en unos minutos.';
      }
      toast.error(msg, {
        className: 'font-custom text-lg',
      });
    }
  };

  const marketplaceName =
    process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<
    string,
    {
      bgColor: string;
      hoverBgColor: string;
      bgColorAlternativo: string;
      fuente: string;
      fuenteAlterna: string;
      fuenteVariante: string;
    }
  > = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente: 'font-jostBold',
      fuenteAlterna: 'font-jostRegular',
      fuenteVariante: 'font-jostItalic',
    },
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor: 'bg-custom-dark',
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente: 'font-semibold',
    fuenteAlterna: 'font-medium',
    fuenteVariante: 'font-normal',
  };

  const canSubmitCode = useMemo(
    () => resolvedUsername.length > 0,
    [resolvedUsername]
  );

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
        <h2 className="font-jostBold text-3xl font-normal pb-2 text-center">
          Código de confirmación
        </h2>
        {emailFromQuery && (
          <div
            id="alert-additional-content-3"
            className="p-4 mb-5 space-y-4 text-green-600 border border-green-200 rounded-md bg-green-100 dark:bg-gray-700 dark:text-green-300 dark:border-green-700 text-center"
          >
            <p className={`${colors.fuenteVariante} text-sm font-medium`}>
              Se ha enviado el código de confirmación a su correo registrado:{' '}
              <strong className={`${colors.fuente}`}>{emailFromQuery}</strong>
            </p>
          </div>
        )}
        <h4 className="font-jostRegular text-1xl font-normal">
          Por favor, ingrese el código de confirmación:
        </h4>
        <p
          className={`${
            !errors.loginError && 'hidden'
          } text-red-400 text-xs`}
        >
          {errors.loginError}
        </p>
        <form className="pt-2" onSubmit={submitFromConfirmationCode}>
          {/* Username solo si no viene del paso anterior */}
          {!hasKnownUsername && (
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="text"
                value={confirmationCode.username}
                name="username"
                onChange={handleChange}
                aria-label="Nombre de usuario"
                className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="font-jostRegular peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Usuario
              </label>
            </div>
          )}

          {/* Identidad ya conocida: no pedir Username de nuevo */}
          {hasKnownUsername && (
            <input type="hidden" name="username" value={resolvedUsername} />
          )}

          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={!canSubmitCode}
              value={confirmationCode.confirmationCode}
              name="confirmationCode"
              onChange={handleChange}
              aria-label="Código de confirmación"
              className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer disabled:opacity-60"
              placeholder=" "
              required
            />
            <label className="font-jostRegular peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Código
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmitCode}
            aria-label="Confirmar código"
            className="font-jostBold relative flex items-center justify-center h-10 text-white bg-custom-marca-boton hover:bg-custom-marca-boton-variante focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-base mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4 disabled:bg-[#cfd4c0] disabled:text-[#3f4330] disabled:cursor-not-allowed disabled:hover:bg-[#cfd4c0]"
          >
            {loading ? (
              <TailSpin
                width="30"
                color="#fff"
                wrapperClass="font-jostRegular absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 "
              />
            ) : (
              'Confirmar código'
            )}
          </button>
        </form>

        <button
          type="button"
          className="h-10 text-base relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-8 py-2 mt-4"
          onClick={resendCode}
          aria-label="Reenviar código de confirmación"
        >
          Reenviar código
        </button>
      </>
    </div>
  );
};

export default ConfirmCode;
