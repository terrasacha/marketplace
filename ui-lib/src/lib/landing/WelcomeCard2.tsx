import React, { useState, useEffect, useCallback } from 'react';
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

export type LinkedWalletItem = { id: string; name?: string; address?: string; stake_address?: string };

const WelcomeCard2 = (props: WelcomeCard2Props) => {
  const { checkingWallet, handleSetCheckingWallet, appName, poweredby } = props;
  const router = useRouter();
  const [userData, setUserData] = useState(null) as any;
  const [linkedWallets, setLinkedWallets] = useState<LinkedWalletItem[]>([]);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'select' | 'create' | 'import'>('select');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [showPasswordModalForContinue, setShowPasswordModalForContinue] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [walletSessionReady, setWalletSessionReady] = useState<boolean>(false);
  
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

  // Función para obtener billeteras vinculadas al usuario
  const checkUserWallet = useCallback(async (userId: string) => {
    try {
      const response = await fetch('/api/calls/backend/getWalletByUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const raw = await response.json();
      const wallets: LinkedWalletItem[] = Array.isArray(raw) ? raw : [];
      setLinkedWallets(wallets);
      setHasWallet(wallets.length > 0);
      return wallets.length > 0;
    } catch (error) {
      console.error('Error al verificar wallet del usuario:', error);
      setLinkedWallets([]);
      setHasWallet(false);
      return false;
    } finally {
      setIsCheckingWallet(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const user = await currentAuthenticatedUser();
      if (user) {
        setUserData(user);
        setIsCheckingWallet(true);
        await checkUserWallet(user.userId);
      } else {
        setIsCheckingWallet(false);
      }
    };
    init();
  }, [checkUserWallet]);

  // Sincronizar tab con query (?tab=create | ?tab=import) para abrir el tab correcto al llegar desde el sidebar
  useEffect(() => {
    if (!router.isReady) return;
    const tab = router.query.tab;
    if (tab === 'create' || tab === 'import') {
      setViewMode(tab);
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    if (!userData || isCheckingWallet) return;
    const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('wallet_session') : null;
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.access_token) setWalletSessionReady(true);
      } catch (_) {}
    }
  }, [userData, isCheckingWallet]);

  useEffect(() => {
    if (linkedWallets.length === 1 && !selectedWalletId) {
      setSelectedWalletId(linkedWallets[0].id);
    }
  }, [linkedWallets, selectedWalletId]);

  useEffect(() => {
    if (checkingWallet === 'unauthorized' && handleSetCheckingWallet) {
      setTimeout(() => {
        handleSetCheckingWallet('uncheck');
      }, 1500);
    }
  }, [checkingWallet, handleSetCheckingWallet]);

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
      const { performWalletSignOut } = await import('@marketplaces/ui-lib/src/lib/common/walletApi');
      await performWalletSignOut(signOut);
      router.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aún así intentar cerrar sesión de AWS Amplify
      try {
        await signOut();
        router.reload();
      } catch (signOutError) {
        console.error('Error al cerrar sesión de AWS Amplify:', signOutError);
      }
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
      
      // Actualizar estado de wallet después de crear
      if (userId) {
        await checkUserWallet(userId);
      }
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
      const userId = userData?.userId || null;
      if (userId) {
        try {
          await fetch('/api/wallets/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              wallet_id: result.data.wallet_id,
              name: result.data.name ?? importWalletName,
              enterprise_address: result.data.enterprise_address ?? result.data.address ?? '',
              staking_address: result.data.staking_address ?? '',
            }),
          });
        } catch (linkErr) {
          console.error('Error al vincular billetera importada:', linkErr);
        }
        await checkUserWallet(userId);
      }
      await unlockWallet(result.data.wallet_id, importPassword);
      setWalletSessionReady(true);
      setViewMode('select');
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

  const handleContinueToMarketplace = () => {
    if (canContinueToMarketplace()) {
      router.push('/wallet');
      return;
    }
    if (!selectedWalletId) {
      toast.error('Selecciona una billetera de la lista para continuar.');
      return;
    }
    setShowPasswordModalForContinue(true);
    setUnlockPassword('');
    setUnlockError(null);
  };

  const handleUnlockAndContinue = async () => {
    if (!selectedWalletId || !unlockPassword.trim()) {
      setUnlockError('Ingresa la contraseña de la billetera.');
      return;
    }
    setUnlockError(null);
    setIsUnlocking(true);
    try {
      const result = await unlockWallet(selectedWalletId, unlockPassword.trim());
      if (result.success) {
        setWalletSessionReady(true);
        setShowPasswordModalForContinue(false);
        setUnlockPassword('');
        toast.success('Listo. Redirigiendo al marketplace...');
        router.push('/wallet');
      } else {
        setUnlockError(result.error || 'Error al desbloquear.');
      }
    } catch (err) {
      setUnlockError('Error al desbloquear la billetera.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const canContinueToMarketplace = (): boolean => {
    if (typeof window === 'undefined') return walletSessionReady;
    try {
      const sessionStr = window.localStorage.getItem('wallet_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.access_token) return true;
      }
    } catch (_) {}
    return walletSessionReady;
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
        <h3 className="font-jostBold text-xl pb-2 flex justify-center text-center mb-2">
          Hola, {userData.username?.toUpperCase() || 'USUARIO'}
        </h3>
      )}

      {isCheckingWallet ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="font-jostRegular text-base text-center text-gray-600">
            Verificando billetera...
          </p>
        </div>
      ) : userData && (hasWallet || viewMode !== 'select') ? (
        <>
          {viewMode === 'select' && (
            <>
              <h2 className="font-jostBold text-2xl pb-2 flex justify-center text-center mt-4">
                {hasWallet ? 'Selecciona una billetera' : 'Bienvenido'}
              </h2>
              <p className="font-jostRegular text-base text-center mb-4 text-gray-600 leading-relaxed">
                Selecciona una de tus billeteras para continuar. Luego pulsa Continuar al Marketplace e ingresa la contraseña.
              </p>
            </>
          )}
          {viewMode === 'create' && !createdWallet && (
            <>
              <h2 className="font-jostBold text-2xl pb-2 flex justify-center text-center mt-4">
                Crear nueva billetera
              </h2>
              <p className="font-jostRegular text-base text-center mb-4 text-gray-600 leading-relaxed">
                La billetera quedará vinculada a tu cuenta.
              </p>
            </>
          )}
          {viewMode === 'create' && createdWallet && (
            <>
              <h2 className="font-jostBold text-2xl pb-2 flex justify-center text-center mt-4">
                Billetera creada
              </h2>
              <p className="font-jostRegular text-base text-center mb-4 text-gray-600 leading-relaxed">
                Guarda tu frase de recuperación antes de continuar.
              </p>
            </>
          )}
          {viewMode === 'import' && (
            <>
              <h2 className="font-jostBold text-2xl pb-2 flex justify-center text-center mt-4">
                Importar billetera
              </h2>
              <p className="font-jostRegular text-base text-center mb-4 text-gray-600 leading-relaxed">
                Usa tu frase de recuperación de 24 palabras. Quedará vinculada a tu cuenta.
              </p>
            </>
          )}
        </>
      ) : userData ? (
        <>
          <h2 className="font-jostBold text-2xl pb-2 flex justify-center text-center mt-4">
            ¡Bienvenido a nuestro Marketplace!
          </h2>
          <p className="font-jostRegular text-base text-center mb-4 text-gray-600 leading-relaxed">
            El siguiente paso es crear tu billetera virtual o importar una existente.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-jostBold text-2xl pb-2 flex justify-center text-center mt-4">
            ¡Bienvenido a nuestro Marketplace!
          </h2>
          <p className="text-base pb-2 text-center font-jostRegular text-gray-600 mb-4 leading-relaxed">
            Para comenzar a usar la aplicación, necesitas una billetera virtual.
            Inicia sesión para continuar.
          </p>
        </>
      )}

      {(checkingWallet === 'checking' ||
        checkingWallet === 'authorized' ||
        checkingWallet === 'unauthorized') && (
        <p
          className={`flex justify-center items-center text-sm mb-2 ${
            checkingWallet === 'unauthorized' ? 'text-red-400' : 'text-slate-600'
          }`}
        >
          {checkingWallet === 'checking' && 'Cargando...'}
          {checkingWallet === 'authorized' && 'Billetera autorizada. Redirigiendo...'}
          {checkingWallet === 'unauthorized' && 'Billetera no autorizada.'}
        </p>
      )}

      {isCheckingWallet ? null : !userData ? (
        <Link href={'/auth/login'}>
          <button className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-8 py-2">
            Ingresar
          </button>
        </Link>
      ) : userData && viewMode === 'select' ? (
        /* Listado de billeteras vinculadas + opción importar/crear + continuar solo si hay sesión */
        <div className="w-full space-y-4">
          {linkedWallets.length > 0 && (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {linkedWallets.map((w) => {
                const isSelected = selectedWalletId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 transition-colors rounded-none border-l-4 ${
                      isSelected
                        ? 'bg-custom-marca-boton/10 border-custom-marca-boton'
                        : 'border-transparent'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`Seleccionar billetera ${w.name || w.id}`}
                  >
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-custom-marca-boton bg-custom-marca-boton' : 'border-gray-400'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-jostBold text-sm text-gray-900 truncate">{w.name || 'Sin nombre'}</p>
                      <p className="text-xs text-gray-500 font-mono truncate" title={w.id}>{w.id}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {linkedWallets.length === 0 && (
            <p className="text-base text-gray-600 text-center py-2 font-jostRegular leading-relaxed">
              No tienes billeteras vinculadas. Crea una o importa una existente.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('create')}
              className="font-jostBold flex-1 text-base text-custom-marca-boton hover:text-custom-marca-boton-variante border border-custom-marca-boton rounded-lg px-3 py-3"
            >
              Crear nueva billetera
            </button>
            <button
              type="button"
              onClick={() => setViewMode('import')}
              className="font-jostBold flex-1 text-base text-custom-marca-boton hover:text-custom-marca-boton-variante border border-custom-marca-boton rounded-lg px-3 py-3"
            >
              Importar billetera
            </button>
          </div>
          {(linkedWallets.length > 0 || canContinueToMarketplace()) && (
            <button
              onClick={handleContinueToMarketplace}
              onKeyDown={(e) => handleKeyDown(e, handleContinueToMarketplace)}
              className="font-jostBold relative w-full flex items-center justify-center text-base text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante rounded-lg focus:ring-2 px-8 py-3"
              tabIndex={0}
              aria-label="Continuar al Marketplace"
            >
              Continuar al Marketplace
            </button>
          )}
          <button
            onClick={handleSignOut}
            onKeyDown={(e) => handleKeyDown(e, handleSignOut)}
            className="font-jostBold relative w-full flex items-center justify-center text-base text-white bg-custom-marca-boton border-transparent hover:bg-custom-marca-boton-variante rounded-lg focus:ring-2 px-8 py-3"
            tabIndex={0}
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      ) : createdWallet ? (
        /* Interfaz de billetera creada - completamente separada */
        <div className="w-full mb-3">
          <div
            className="rounded-xl p-5 border border-[#e0c56a]/60 bg-gradient-to-b from-[#fff8e6] to-[#fffdf6] shadow-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3 mb-5">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f3e2a5] flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-5 h-5 text-[#6e6c35]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-jostBold text-base text-[#44482c]">
                  Guarda tu frase de recuperación de forma segura
                </p>
                <p className="font-jostRegular text-sm text-[#5c5a3a] leading-relaxed">
                  Esta frase no se volverá a mostrar. La necesitarás para recuperar tu
                  billetera si olvidas tu contraseña. Anótala en un lugar seguro y no la
                  compartas con nadie.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e8d79a] mb-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-jostBold text-gray-800">
                  Frase de recuperación (24 palabras)
                </p>
                <CopyToClipboard
                  copyValue={createdWallet.mnemonic}
                  tooltipLabel="Copiar frase de recuperación"
                  className="flex-shrink-0"
                  iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                />
              </div>
              <p className="text-base font-jostBold text-gray-900 break-words leading-relaxed tracking-wide">
                {createdWallet.mnemonic}
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-jostBold min-w-[9.5rem] text-gray-800">
                  ID de billetera
                </span>
                <span className="truncate flex-1 font-mono text-xs sm:text-sm" title={createdWallet.wallet_id}>
                  {createdWallet.wallet_id}
                </span>
                <CopyToClipboard
                  copyValue={createdWallet.wallet_id}
                  tooltipLabel="Copiar ID de billetera"
                  className="flex-shrink-0"
                  iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-jostBold min-w-[9.5rem] text-gray-800">
                  Dirección enterprise
                </span>
                <span
                  className="truncate flex-1 font-mono text-xs sm:text-sm"
                  title={createdWallet.enterprise_address}
                >
                  {createdWallet.enterprise_address}
                </span>
                <CopyToClipboard
                  copyValue={createdWallet.enterprise_address}
                  tooltipLabel="Copiar dirección enterprise"
                  className="flex-shrink-0"
                  iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-jostBold min-w-[9.5rem] text-gray-800">
                  Dirección de staking
                </span>
                <span
                  className="truncate flex-1 font-mono text-xs sm:text-sm"
                  title={createdWallet.staking_address}
                >
                  {createdWallet.staking_address}
                </span>
                <CopyToClipboard
                  copyValue={createdWallet.staking_address}
                  tooltipLabel="Copiar dirección de staking"
                  className="flex-shrink-0"
                  iconClassName="w-4 h-4 text-gray-500 hover:text-custom-marca-boton"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                if (createdWallet?.wallet_id && createdWallet?._password) {
                  await unlockWallet(createdWallet.wallet_id, createdWallet._password);
                  setWalletSessionReady(true);
                }
                setCreatedWallet(null);
                router.push('/wallet');
              }}
              className="font-jostBold w-full flex items-center justify-center text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante rounded-lg focus:ring-2 px-4 py-3 text-base"
              tabIndex={0}
              aria-label="Continuar"
            >
              Continuar
            </button>
          </div>
        </div>
      ) : (
        /* Interfaces de crear/importar billetera */
        <>
          {linkedWallets.length > 0 && (
            <button
              type="button"
              onClick={() => setViewMode('select')}
              className="font-jostBold text-base text-custom-marca-boton hover:text-custom-marca-boton-variante mb-3"
            >
              ← Volver a lista de billeteras
            </button>
          )}
          <div className="w-full mb-3">
            {viewMode === 'create' ? (
              /* Sección: Create New Wallet */
              <div className="rounded-lg p-5 border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                      className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                        createValidationErrors.name
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                      tabIndex={0}
                      aria-label="Nombre de la billetera nueva"
                    />
                    {createValidationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{createValidationErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                        className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                          createValidationErrors.password
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Contraseña nueva"
                      />
                      {createValidationErrors.password && (
                        <p className="text-red-500 text-sm mt-1">{createValidationErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                        className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                          createValidationErrors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Confirmar contraseña nueva"
                      />
                      {createValidationErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {createValidationErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {createWalletError && (
                    <div className="text-red-500 text-sm text-center mb-2">
                      {createWalletError}
                    </div>
                  )}

                  <button
                    onClick={handleCreateWallet}
                    onKeyDown={(e) => handleKeyDown(e, handleCreateWallet)}
                    disabled={isCreatingWallet}
                    className="font-jostBold w-full flex items-center justify-center text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-4 py-3 text-base mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="space-y-3">
                  <div>
                    <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                      className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                        importValidationErrors.name
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                      tabIndex={0}
                      aria-label="Nombre de la billetera importada"
                    />
                    {importValidationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{importValidationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                      className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                        importValidationErrors.mnemonic
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton resize-none`}
                      tabIndex={0}
                      aria-label="Frase mnemónica de 24 palabras"
                    />
                    {importValidationErrors.mnemonic && (
                      <p className="text-red-500 text-sm mt-1">{importValidationErrors.mnemonic}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                        className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                          importValidationErrors.password
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Nueva contraseña para billetera importada"
                      />
                      {importValidationErrors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {importValidationErrors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base font-jostBold mb-1.5 text-gray-800">
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
                        className={`w-full px-3 py-2.5 rounded-lg text-base border ${
                          importValidationErrors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-custom-marca-boton`}
                        tabIndex={0}
                        aria-label="Confirmar nueva contraseña para billetera importada"
                      />
                      {importValidationErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {importValidationErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {importWalletError && (
                    <div className="text-red-500 text-sm text-center mb-2">
                      {importWalletError}
                    </div>
                  )}

                  <button
                    onClick={handleImportWallet}
                    onKeyDown={(e) => handleKeyDown(e, handleImportWallet)}
                    disabled={isImportingWallet}
                    className="font-jostBold w-full flex items-center justify-center text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 rounded-lg focus:ring-2 px-4 py-3 text-base mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex={0}
                    aria-label="Importar billetera"
                  >
                    {isImportingWallet ? 'Importando billetera...' : 'Importar Billetera'}
                  </button>
                </div>
              </div>
            )}

            {/* Enlace para alternar entre vistas */}
            <div className="text-center mt-4">
              <button
                onClick={handleToggleView}
                onKeyDown={handleToggleViewKeyDown}
                className="text-base font-jostBold text-custom-marca-boton hover:text-custom-marca-boton-variante underline focus:outline-none focus:ring-2 focus:ring-custom-marca-boton rounded px-2 py-1"
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

      {/* Modal contraseña al continuar al marketplace */}
      {showPasswordModalForContinue && selectedWalletId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="unlock-modal-title">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 id="unlock-modal-title" className="font-jostBold text-xl mb-2">Contraseña de la billetera</h3>
            <p className="text-base text-gray-600 mb-3">
              {linkedWallets.find((w) => w.id === selectedWalletId)?.name || selectedWalletId}
            </p>
            <p className="text-base text-gray-600 mb-3 leading-relaxed">Ingresa la contraseña de esta billetera para continuar al marketplace.</p>
            <label className="block text-base font-jostBold mb-1.5 text-gray-800">Contraseña</label>
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => { setUnlockPassword(e.target.value); setUnlockError(null); }}
              placeholder="Contraseña de la billetera"
              className="w-full px-3 py-2.5 rounded-lg text-base border border-gray-300 focus:ring-2 focus:ring-custom-marca-boton mb-2"
              aria-label="Contraseña"
            />
            {unlockError && <p className="text-red-500 text-sm mb-2">{unlockError}</p>}
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => { setShowPasswordModalForContinue(false); setUnlockPassword(''); setUnlockError(null); }}
                className="font-jostRegular px-4 py-2.5 border border-gray-300 rounded-lg text-base hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUnlockAndContinue}
                disabled={isUnlocking || !unlockPassword.trim()}
                className="font-jostBold px-4 py-2.5 text-white bg-custom-marca-boton hover:bg-custom-marca-boton-variante rounded-lg text-base disabled:opacity-50"
              >
                {isUnlocking ? 'Verificando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
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
