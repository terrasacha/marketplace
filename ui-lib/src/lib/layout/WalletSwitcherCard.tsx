import React, { useState, useEffect, useCallback, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { WalletContext } from '@marketplaces/utils-2';
import { unlockWallet } from '../common/walletApi';
import { toast } from 'sonner';

export type LinkedWalletItem = { id: string; name?: string; address?: string; stake_address?: string; isAdmin?: boolean };

interface WalletSwitcherCardProps {
  className?: string;
  onCloseSidebar?: () => void;
}

export default function WalletSwitcherCard({ className = '', onCloseSidebar }: WalletSwitcherCardProps) {
  const router = useRouter();
  const { walletID, walletName, handleWalletData } = useContext<any>(WalletContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [linkedWallets, setLinkedWallets] = useState<LinkedWalletItem[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [walletToSwitch, setWalletToSwitch] = useState<LinkedWalletItem | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const fetchLinkedWallets = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const res = await fetch('/api/calls/backend/getWalletByUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId }),
      });
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw : [];
      setLinkedWallets(list.map((w: any) => ({
        id: w.id ?? w.wallet_id,
        name: w.name,
        address: w.address ?? w.enterprise_address ?? '',
        stake_address: w.stake_address ?? w.staking_address,
        isAdmin: w.isAdmin ?? false,
      })));
    } catch (e) {
      console.error(e);
      setLinkedWallets([]);
    } finally {
      setLoadingWallets(false);
    }
  }, []);

  useEffect(() => {
    if (modalOpen) {
      setLoadingWallets(true);
      setWalletToSwitch(null);
      setSwitchPassword('');
      setSwitchError(null);
      fetchLinkedWallets();
    }
  }, [modalOpen, fetchLinkedWallets]);

  const handleSwitchWallet = async () => {
    if (!walletToSwitch || !switchPassword.trim()) {
      setSwitchError('Ingresa la contraseña.');
      return;
    }
    setSwitchError(null);
    setSwitching(true);
    try {
      const result = await unlockWallet(walletToSwitch.id, switchPassword.trim());
      if (result.success) {
        await handleWalletData({
          walletID: walletToSwitch.id,
          walletName: walletToSwitch.name ?? walletToSwitch.id,
          walletAddress: walletToSwitch.address ?? '',
          isWalletBySuan: true,
          isWalletAdmin: walletToSwitch.isAdmin ?? false,
        });
        toast.success('Billetera cambiada.');
        setWalletToSwitch(null);
        setSwitchPassword('');
        setModalOpen(false);
        onCloseSidebar?.();
        // No hace falta reload: handleWalletData ya actualiza el contexto y dispara fetchWalletData
        // con el nuevo walletID; MainLayout reacciona a walletData?.balance y actualiza el saldo.
      } else {
        setSwitchError(result.error || 'Error al desbloquear.');
      }
    } catch {
      setSwitchError('Error al cambiar de billetera.');
    } finally {
      setSwitching(false);
    }
  };

  const goToLanding = (tab: 'create' | 'import') => {
    setModalOpen(false);
    onCloseSidebar?.();
    router.push(`/?tab=${tab}`);
  };

  const displayName = walletName || walletID || 'Billetera';
  const isCurrentWallet = (w: LinkedWalletItem) => w.id === walletID;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-2 w-full p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-left transition-colors ${className}`}
        aria-label="Cambiar billetera"
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-custom-marca-boton/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-custom-marca-boton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500">Billetera actual</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 9999 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-switcher-title"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 id="wallet-switcher-title" className="text-lg font-semibold text-gray-900">
                Cambiar billetera
              </h2>
              <button
                type="button"
                onClick={() => { setModalOpen(false); setWalletToSwitch(null); }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {walletToSwitch ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Contraseña de &quot;{walletToSwitch.name || walletToSwitch.id}&quot;</p>
                  <input
                    type="password"
                    value={switchPassword}
                    onChange={(e) => { setSwitchPassword(e.target.value); setSwitchError(null); }}
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-custom-marca-boton mb-2"
                  />
                  {switchError && <p className="text-red-500 text-xs mb-2">{switchError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setWalletToSwitch(null); setSwitchPassword(''); setSwitchError(null); }}
                      className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSwitchWallet}
                      disabled={switching || !switchPassword.trim()}
                      className="flex-1 py-2 rounded-lg bg-custom-marca-boton text-white text-sm font-medium hover:bg-custom-marca-boton-variante disabled:opacity-50"
                    >
                      {switching ? 'Cambiando...' : 'Usar esta billetera'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {loadingWallets ? (
                    <p className="text-sm text-gray-500 text-center py-4">Cargando billeteras...</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        {linkedWallets.length === 0
                          ? 'No tienes billeteras vinculadas a tu cuenta. Puedes crear una nueva o importar una existente desde la pantalla de inicio.'
                          : `Se encontr${linkedWallets.length === 1 ? 'ó' : 'aron'} ${linkedWallets.length} billetera${linkedWallets.length === 1 ? '' : 's'} vinculada${linkedWallets.length === 1 ? '' : 's'} a tu cuenta. Selecciona una para cambiar.`}
                      </p>
                      {linkedWallets.length > 0 ? (
                    <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-56 overflow-y-auto">
                      {linkedWallets.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            if (isCurrentWallet(w)) return;
                            setWalletToSwitch(w);
                            setSwitchPassword('');
                            setSwitchError(null);
                          }}
                          disabled={isCurrentWallet(w)}
                          className={`w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 transition-colors rounded-none border-l-4 ${
                            isCurrentWallet(w) ? 'bg-gray-50 border-custom-marca-boton opacity-75' : 'border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-gray-900 truncate">{w.name || 'Sin nombre'}</p>
                            <p className="text-xs text-gray-500 font-mono truncate" title={w.id}>{w.id}</p>
                          </div>
                          {isCurrentWallet(w) ? (
                            <span className="text-xs font-medium text-custom-marca-boton">En uso</span>
                          ) : (
                            <span className="text-xs text-gray-500">Cambiar</span>
                          )}
                        </button>
                      ))}
                    </div>
                      ) : null}
                  </>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">¿Quieres agregar otra billetera?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => goToLanding('create')}
                        className="flex-1 py-2 text-sm font-medium text-custom-marca-boton border border-custom-marca-boton rounded-lg hover:bg-custom-marca-boton/5"
                      >
                        Crear nueva
                      </button>
                      <button
                        type="button"
                        onClick={() => goToLanding('import')}
                        className="flex-1 py-2 text-sm font-medium text-custom-marca-boton border border-custom-marca-boton rounded-lg hover:bg-custom-marca-boton/5"
                      >
                        Importar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
