import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  createWallet,
  importWallet,
  unlockWallet,
  storeWalletSession,
  generateSessionKey,
  storeSession,
} from '../common/walletApi';
import CopyToClipboard from '../common/CopyToClipboard';

interface WelcomeCard2Props {
  checkingWallet?: any;
  handleSetCheckingWallet?: any;
  appName?: string;
  poweredby?: boolean;
}

// Esquemas de validación con Zod
const walletNameSchema = z.string().min(1, 'El nombre de la billetera es requerido').max(50, 'El nombre de la billetera no puede exceder 50 caracteres');

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un dígito')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial');

const createWalletSchema = z.object({
  name: walletNameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const importWalletSchema = z.object({
  name: walletNameSchema,
  mnemonic: z.string().min(1, 'La frase mnemónica es requerida'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const WelcomeCard2 = (props: WelcomeCard2Props) => {
  const { checkingWallet, handleSetCheckingWallet, appName, poweredby } = props;
  const router = useRouter();
  const [userData, setUserData] = useState(null) as any;
  const [viewMode, setViewMode] = useState<'create' | 'import'>('create');
  
  // Estados para errores de validación
  const [createValidationErrors, setCreateValidationErrors] = useState<Record<string, string>>({});
  const [importValidationErrors, setImportValidationErrors] = useState<Record<string, string>>({});

  // Estados para Create New Wallet
  const [newWalletName, setNewWalletName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [createdWallet, setCreatedWallet] = useState<any>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [createWalletError, setCreateWalletError] = useState<string | null>(null);

  // Estados para Import Existing Wallet
  const [importWalletName, setImportWalletName] = useState('');
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importConfirmPassword, setImportConfirmPassword] = useState('');
  const [isImportingWallet, setIsImportingWallet] = useState(false);
  const [importWalletError, setImportWalletError] = useState<string | null>(null);

  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      setUserData(res);
    });
  }, []);

  useEffect(() => {
    if (checkingWallet === 'unauthorized') {
      setTimeout(() => {
        handleSetCheckingWallet('uncheck');
      }, 1500);
    }
  }, [checkingWallet]);

  const currentAuthenticatedUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) return user;
    } catch (err) {
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const handleCreateWallet = async () => {
    // Limpiar errores previos
    setCreateValidationErrors({});
    setCreateWalletError(null);

    // Validar con Zod
    try {
      createWalletSchema.parse({
        name: newWalletName,
        password: newPassword,
        confirmPassword: newConfirmPassword,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setCreateValidationErrors(errors);
        
        // Mostrar el primer error en toast
        const firstError = error.issues[0];
        if (firstError) {
          toast.error(firstError.message);
        }
        return;
      }
    }

    setIsCreatingWallet(true);

    const userId = userData?.userId || null;

    const result = await createWallet({
      name: newWalletName,
      network: 'testnet',
      password: newPassword,
      ...(userId && { userId }),
    });

    if (result.success && result.data) {
      const walletId = result.data.wallet_id;
      
      // Configurar auto-unlock después de crear la wallet
      if (userId && walletId) {
        try {
          // Generar session key
          const sessionKey = generateSessionKey();
          const frontendSessionId = `terrasacha_${userId}`;

          // Almacenar sesión para auto-unlock
          await storeSession(
            walletId,
            userId,
            newPassword,
            sessionKey,
            frontendSessionId,
            24 // 24 horas de expiración
          );
        } catch (sessionError) {
          console.error('Error al configurar auto-unlock:', sessionError);
          // No fallar la creación de wallet si hay error al configurar auto-unlock
          // Solo loguear el error
        }
      }

      setCreatedWallet({
        ...result.data,
        _password: newPassword,
      });
      setNewWalletName('');
      setNewPassword('');
      setNewConfirmPassword('');
    } else if (result.error) {
      setCreateWalletError(result.error);
    }

    setIsCreatingWallet(false);
  };

  const handleImportWallet = async () => {
    // Limpiar errores previos
    setImportValidationErrors({});
    setImportWalletError(null);

    // Validar con Zod
    try {
      importWalletSchema.parse({
        name: importWalletName,
        mnemonic: mnemonicPhrase,
        password: importPassword,
        confirmPassword: importConfirmPassword,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setImportValidationErrors(errors);
        
        // Mostrar el primer error en toast
        const firstError = error.issues[0];
        if (firstError) {
          toast.error(firstError.message);
        }
        return;
      }
    }

    setIsImportingWallet(true);

    const result = await importWallet({
      mnemonic: mnemonicPhrase,
      name: importWalletName,
      network: 'testnet',
      password: importPassword,
    });

    if (result.success && result.data) {
      await unlockWallet(result.data.wallet_id, importPassword);
      router.push('/restore-wallet');
    } else if (result.error) {
      setImportWalletError(result.error);
    }

    setIsImportingWallet(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback();
    }
  };

  const handleToggleView = () => {
    setViewMode(viewMode === 'create' ? 'import' : 'create');
  };

  const handleToggleViewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleView();
    }
  };

  return (
    <div className="bg-white rounded-2xl w-[600px] max-w-[600px] py-8 px-8 h-auto flex flex-col justify-center">
      {appName === 'Terrasacha' && (
        <div className="flex justify-center mb-4">
          <Image
            src="/v2/logoterrasacha.svg"
            width={300}
            height={60}
            alt="Logotipo de Terrasacha"
          />
        </div>
      )}

      {userData && (
        <h3 className="font-jostBold text-lg pb-2 flex justify-center text-center mb-2">
          Hola, {userData.username?.toUpperCase() || 'USUARIO'}
        </h3>
      )}

      <h2 className="font-jostBold text-xl pb-2 flex justify-center text-center mt-4">
        {userData
          ? 'Crea tu billetera o utiliza una preexistente'
          : '¡Bienvenido a nuestro Marketplace!'}
      </h2>
      {userData ? (
        <p className="font-jostRegular text-xs text-center mb-4 text-gray-600">
          El siguiente paso es crear tu billetera virtual o utilizar una que hayas creado previamente (asegúrate de tener tus mnemonics o grupo secreto de palabras).
        </p>
      ) : (
        <p className="text-xs pb-2 text-center font-jostRegular text-gray-600 mb-4">
          Para comenzar a usar la aplicación, necesitas una billetera virtual
          con el token de acceso de nuestra organización. Puedes crear tu
          billetera y usuario directamente en nuestra plataforma.
        </p>
      )}

      {(checkingWallet === 'checking' ||
        checkingWallet === 'authorized' ||
        checkingWallet === 'unauthorized') && (
        <p
          className={`flex justify-center items-center text-xs mb-2 ${
            checkingWallet === 'unauthorized' ? 'text-red-400' : 'text-slate-600'
          }`}
        >
          {checkingWallet === 'checking' && 'Cargando...'}
          {checkingWallet === 'authorized' && 'Billetera autorizada. Redirigiendo...'}
          {checkingWallet === 'unauthorized' && 'Billetera no autorizada.'}
        </p>
      )}

      {!userData ? (
        <Link href={'/auth/login'}>
          <button className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-8 py-2">
            Ingresar
          </button>
        </Link>
      ) : createdWallet ? (
        /* Interfaz de billetera creada - completamente separada */
        <div className="w-full mb-3">
          <div className="rounded-lg p-5 border border-gray-200">
            <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-center">
                <p className="text-yellow-800 font-jostBold text-sm mb-2">
                  {createdWallet.warning || '⚠️ IMPORTANT: Save your mnemonic phrase securely!'}
                </p>
                <div className="bg-white p-3 rounded border border-gray-300 mb-2">
                  <p className="text-xs font-jostRegular text-gray-700 mb-1">Frase de Recuperación (24 palabras):</p>
                  <p className="text-sm font-jostBold text-gray-900 break-words">
                    {createdWallet.mnemonic}
                  </p>
                </div>
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-jostBold min-w-[100px]">Wallet ID:</span>
                    <span className="truncate flex-1">{createdWallet.wallet_id}</span>
                    <CopyToClipboard
                      copyValue={createdWallet.wallet_id}
                      tooltipLabel="Copiar Wallet ID"
                      className="flex-shrink-0"
                      iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-jostBold min-w-[100px]">Enterprise Address:</span>
                    <span className="truncate flex-1">{createdWallet.enterprise_address}</span>
                    <CopyToClipboard
                      copyValue={createdWallet.enterprise_address}
                      tooltipLabel="Copiar Enterprise Address"
                      className="flex-shrink-0"
                      iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-jostBold min-w-[100px]">Staking Address:</span>
                    <span className="truncate flex-1">{createdWallet.staking_address}</span>
                    <CopyToClipboard
                      copyValue={createdWallet.staking_address}
                      tooltipLabel="Copiar Staking Address"
                      className="flex-shrink-0"
                      iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (createdWallet?.wallet_id && createdWallet?._password) {
                      await unlockWallet(createdWallet.wallet_id, createdWallet._password);
                    }
                    setCreatedWallet(null);
                    router.push('/home');
                  }}
                  className="font-jostBold w-full flex items-center justify-center text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-4 py-2.5 text-sm mt-3"
                  tabIndex={0}
                  aria-label="Continuar"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Interfaces de crear/importar billetera */
        <>
          <div className="w-full mb-3">
            {viewMode === 'create' ? (
              /* Sección: Create New Wallet */
              <div className="rounded-lg p-5 border border-gray-200">
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                      Nombre de la Billetera
                    </label>
                    <input
                      type="text"
                      value={newWalletName}
                      onChange={(e) => {
                        setNewWalletName(e.target.value);
                        if (createValidationErrors.name) {
                          setCreateValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.name;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="ej. Billetera del Tesoro"
                      className={`w-full px-3 py-2 rounded-lg text-sm border ${
                        createValidationErrors.name
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                      tabIndex={0}
                      aria-label="Nombre de la billetera nueva"
                    />
                    {createValidationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{createValidationErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (createValidationErrors.password) {
                            setCreateValidationErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.password;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="Contraseña"
                        className={`w-full px-3 py-2 rounded-lg text-sm border ${
                          createValidationErrors.password
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Contraseña nueva"
                      />
                      {createValidationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{createValidationErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                        Confirmar
                      </label>
                      <input
                        type="password"
                        value={newConfirmPassword}
                        onChange={(e) => {
                          setNewConfirmPassword(e.target.value);
                          if (createValidationErrors.confirmPassword) {
                            setCreateValidationErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.confirmPassword;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="Confirmar"
                        className={`w-full px-3 py-2 rounded-lg text-sm border ${
                          createValidationErrors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Confirmar contraseña nueva"
                      />
                      {createValidationErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {createValidationErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {createWalletError && (
                    <div className="text-red-500 text-xs text-center mb-2">
                      {createWalletError}
                    </div>
                  )}

                  <button
                    onClick={handleCreateWallet}
                    onKeyDown={(e) => handleKeyDown(e, handleCreateWallet)}
                    disabled={isCreatingWallet}
                    className="font-jostBold w-full flex items-center justify-center text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-4 py-2.5 text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex={0}
                    aria-label="Crear y revelar frase de recuperación"
                  >
                    {isCreatingWallet ? 'Creando billetera...' : 'Crear y Revelar Frase'}
                  </button>
                </div>
              </div>
            ) : (
              /* Sección: Import Existing Wallet */
              <div className="rounded-lg p-5 border border-gray-200">
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                      Nombre de la Billetera
                    </label>
                    <input
                      type="text"
                      value={importWalletName}
                      onChange={(e) => {
                        setImportWalletName(e.target.value);
                        if (importValidationErrors.name) {
                          setImportValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.name;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="ej. Mi Billetera Importada"
                      className={`w-full px-3 py-2 rounded-lg text-sm border ${
                        importValidationErrors.name
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                      tabIndex={0}
                      aria-label="Nombre de la billetera importada"
                    />
                    {importValidationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{importValidationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                      Frase Mnemónica (24 palabras)
                    </label>
                    <textarea
                      value={mnemonicPhrase}
                      onChange={(e) => {
                        setMnemonicPhrase(e.target.value);
                        if (importValidationErrors.mnemonic) {
                          setImportValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.mnemonic;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Ingresa tu frase de recuperación de 24 palabras, separadas por espacios..."
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg text-sm border ${
                        importValidationErrors.mnemonic
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton resize-none`}
                      tabIndex={0}
                      aria-label="Frase mnemónica de 24 palabras"
                    />
                    {importValidationErrors.mnemonic && (
                      <p className="text-red-500 text-xs mt-1">{importValidationErrors.mnemonic}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={importPassword}
                        onChange={(e) => {
                          setImportPassword(e.target.value);
                          if (importValidationErrors.password) {
                            setImportValidationErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.password;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="Nueva contraseña"
                        className={`w-full px-3 py-2 rounded-lg text-sm border ${
                          importValidationErrors.password
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Nueva contraseña para billetera importada"
                      />
                      {importValidationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {importValidationErrors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-jostRegular mb-1 text-gray-700">
                        Confirmar
                      </label>
                      <input
                        type="password"
                        value={importConfirmPassword}
                        onChange={(e) => {
                          setImportConfirmPassword(e.target.value);
                          if (importValidationErrors.confirmPassword) {
                            setImportValidationErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.confirmPassword;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="Confirmar"
                        className={`w-full px-3 py-2 rounded-lg text-sm border ${
                          importValidationErrors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Confirmar nueva contraseña para billetera importada"
                      />
                      {importValidationErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {importValidationErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {importWalletError && (
                    <div className="text-red-500 text-xs text-center mb-2">
                      {importWalletError}
                    </div>
                  )}

                  <button
                    onClick={handleImportWallet}
                    onKeyDown={(e) => handleKeyDown(e, handleImportWallet)}
                    disabled={isImportingWallet}
                    className="font-jostBold w-full flex items-center justify-center text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-4 py-2.5 text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex={0}
                    aria-label="Importar billetera"
                  >
                    {isImportingWallet ? 'Importando billetera...' : 'Importar Billetera'}
                  </button>
                </div>
              </div>
            )}

            {/* Enlace para alternar entre vistas */}
            <div className="text-center mt-3">
              <button
                onClick={handleToggleView}
                onKeyDown={handleToggleViewKeyDown}
                className="text-sm font-jostRegular text-custom-marca-boton hover:text-custom-marca-boton-variante underline focus:outline-none focus:ring-2 focus:ring-custom-marca-boton rounded px-2 py-1"
                tabIndex={0}
                aria-label={viewMode === 'create' ? 'Cambiar a importar billetera existente' : 'Cambiar a crear nueva billetera'}
              >
                {viewMode === 'create'
                  ? 'O, importar una billetera existente'
                  : 'O, crear una nueva billetera'}
              </button>
            </div>
          </div>

          {userData && (
            <button
              onClick={handleSignOut}
              onKeyDown={(e) => handleKeyDown(e, handleSignOut)}
              className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-8 py-2 mt-3"
              tabIndex={0}
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          )}
        </>
      )}

      {poweredby && (
        <div className="flex items-center justify-center mt-3 text-xs font-jostRegular">
          Powered by
          <Image
            src="/v2/logoterrasacha.svg"
            height={60}
            width={69}
            className="ml-2"
            alt={`${appName} logo`}
          />
        </div>
      )}
    </div>
  );
};

export default WelcomeCard2;
