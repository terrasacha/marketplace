import React, { useState } from 'react';
import { toast } from 'sonner';
import { unlockWallet, generateSessionKey, storeSession } from '../common/walletApi';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { LockIcon } from '../icons/LockIcon';
import { getCurrentUser } from 'aws-amplify/auth';

interface WalletUnlockModalProps {
  isOpen: boolean;
  walletId: string;
  walletName?: string;
  onSuccess: () => void;
  onClose?: () => void;
}

const WalletUnlockModal: React.FC<WalletUnlockModalProps> = ({
  isOpen,
  walletId,
  walletName,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError('Por favor ingresa la contraseña de tu billetera');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Hacer unlock tradicional
      const unlockResult = await unlockWallet(walletId, password);

      if (unlockResult.success) {
        // Obtener userId del usuario autenticado
        let userId: string | null = null;
        try {
          const user = await getCurrentUser();
          userId = user.userId;
        } catch (err) {
          console.error('Error al obtener userId:', err);
        }

        // Reconfigurar auto-unlock para futuros logins
        if (userId) {
          try {
            const sessionKey = generateSessionKey();
            const frontendSessionId = `terrasacha_${userId}`;

            await storeSession(
              walletId,
              userId,
              password,
              sessionKey,
              frontendSessionId,
              24 // 24 horas de expiración
            );
          } catch (sessionError) {
            console.error('Error al reconfigurar auto-unlock:', sessionError);
            // No fallar si hay error al reconfigurar auto-unlock, solo loguear
          }
        }

        toast.success('Billetera desbloqueada correctamente');
        setPassword('');
        onSuccess();
      } else {
        setError(unlockResult.error || 'Contraseña incorrecta');
        toast.error(unlockResult.error || 'Error al desbloquear la billetera');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al conectar con el servidor';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUnlock();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="font-jostBold text-xl text-gray-900 mb-2">
            Desbloquear Billetera
          </h2>
          {walletName && (
            <p className="font-jostRegular text-sm text-gray-600">
              {walletName}
            </p>
          )}
          <p className="font-jostRegular text-xs text-gray-500 mt-2">
            Tu sesión de auto-unlock ha expirado. Por favor ingresa tu contraseña para continuar.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-jostRegular mb-1 text-gray-700">
              Contraseña de la Billetera
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3 pointer-events-none">
                <LockIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ingresa tu contraseña"
                className={`font-jostRegular w-full ps-10 pe-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-marca-boton ${
                  error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-custom-marca-boton'
                }`}
                disabled={isLoading}
                tabIndex={0}
                aria-label="Contraseña de la billetera"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 top-0 flex items-center pe-3 cursor-pointer"
                tabIndex={0}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                )}
              </button>
            </div>
            {error && (
              <p className="font-jostRegular text-red-500 text-xs mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {onClose && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className="font-jostBold flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex={0}
                aria-label="Cancelar"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleUnlock}
              disabled={isLoading || !password.trim()}
              className="font-jostBold flex-1 px-4 py-2.5 text-sm text-white bg-custom-marca-boton border border-transparent rounded-lg hover:bg-custom-marca-boton-variante focus:outline-none focus:ring-2 focus:ring-custom-marca-boton disabled:opacity-50 disabled:cursor-not-allowed"
              tabIndex={0}
              aria-label="Desbloquear billetera"
            >
              {isLoading ? 'Desbloqueando...' : 'Desbloquear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletUnlockModal;

