'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingIcon } from '../icons/LoadingIcon';
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon';
import CopyToClipboard from '../common/CopyToClipboard';
import { toast } from 'sonner';

const STORAGE_KEY = 'lastSubmittedTx';
const PENDING_TX_KEY = 'pendingTx'; // clave usada por Transactions / SignTransaction
const EXPIRY_MS = 5 * 60 * 1000; // 5 min
const CUSTOM_EVENT = 'lastSubmittedTxUpdated';
/** Disparado cuando una transacción se confirma en blockchain; el layout puede refrescar balance/historial */
export const TRANSACTION_CONFIRMED_EVENT = 'transactionConfirmed';
const TX_STATUS_POLL_INTERVAL_MS = 12 * 1000; // consultar periódicamente el estado on-chain
const CONFIRMATIONS_THRESHOLD = 1; // número de confirmaciones para dar la tx por confirmada

export interface LastSubmittedTx {
  tx_hash: string;
  explorer_url?: string;
  submitted_at: string;
  title?: string;
  confirmations?: number;
  status?: string;
}

function getStoredPendingTx(): LastSubmittedTx | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { payload, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp <= EXPIRY_MS) return payload;
      localStorage.removeItem(STORAGE_KEY);
    }
    // Fallback: leer pendingTx (formato de SignTransaction/Transactions)
    const pendingRaw = localStorage.getItem(PENDING_TX_KEY);
    if (!pendingRaw) return null;
    const { data, timestamp } = JSON.parse(pendingRaw);
    if (Date.now() - timestamp > EXPIRY_MS) return null;
    const txId = data?.tx_id ?? data?.transaction_id ?? data?.tx_hash;
    if (!txId) return null;
    return {
      tx_hash: txId,
      explorer_url: data?.explorer_url,
      submitted_at: new Date(timestamp).toISOString(),
      title: data?.title ?? 'Transacción en proceso',
    };
  } catch {
    return null;
  }
}

export function setLastSubmittedTx(payload: Omit<LastSubmittedTx, 'submitted_at'> & { submitted_at?: string }) {
  if (typeof window === 'undefined') return;
  const item = {
    payload: {
      ...payload,
      submitted_at: payload.submitted_at ?? new Date().toISOString(),
    },
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT));
}

export function clearLastSubmittedTx() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT));
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function PendingTransactionFloatingCard() {
  const [pending, setPending] = useState<LastSubmittedTx | null>(() => getStoredPendingTx());
  const [collapsed, setCollapsed] = useState(true);
  const [dismissedHash, setDismissedHash] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const next = getStoredPendingTx();
    if (next && next.tx_hash !== dismissedHash) setPending(next);
    else if (!next) setPending(null);
  }, [dismissedHash]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(CUSTOM_EVENT, onUpdate);
    return () => window.removeEventListener(CUSTOM_EVENT, onUpdate);
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getStoredPendingTx();
      if (!next) {
        if (pending) setPending(null);
        return;
      }
      // Si ya fue confirmada/descartada para este hash, no volver a mostrar ni seguir trackeando
      if (next.tx_hash === dismissedHash) {
        if (pending) setPending(null);
        return;
      }
      if (!pending || next.tx_hash !== pending.tx_hash) {
        setPending(next);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pending?.tx_hash, dismissedHash]);

  // Verificar estado con GET /api/transactions/{tx_hash}/status y reflejar número de confirmaciones
  const pendingHashRef = useRef<string | null>(null);
  pendingHashRef.current = pending?.tx_hash ?? null;

  useEffect(() => {
    const txHash = pendingHashRef.current;
    if (!txHash) return;

    const checkConfirmed = async () => {
      try {
        const res = await fetch(`/api/transactions/${encodeURIComponent(txHash)}/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json().catch(() => null);
        const status = data?.status as string | undefined;
        const rawConf = data?.confirmations ?? data?.num_confirmations;
        let confirmations: number | undefined;
        if (typeof rawConf === 'number') {
          confirmations = rawConf;
        } else if (typeof rawConf === 'string') {
          const parsed = parseInt(rawConf, 10);
          if (!Number.isNaN(parsed)) confirmations = parsed;
        }

        // Actualizar el card con el número de confirmaciones actual
        if (confirmations != null || status) {
          setPending((prev) => {
            if (!prev || prev.tx_hash !== txHash) return prev;
            return {
              ...prev,
              confirmations,
              status,
            };
          });
        }

        // Solo dar por confirmada cuando haya un número considerable de confirmaciones, no solo status CONFIRMED
        const isConfirmed =
          confirmations != null && Number(confirmations) >= CONFIRMATIONS_THRESHOLD;

        if (isConfirmed) {
          clearLastSubmittedTx();
          setPending(null);
          setDismissedHash(txHash);
          toast.success('Transacción confirmada en blockchain');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(TRANSACTION_CONFIRMED_EVENT, { detail: { tx_hash: txHash } }));
          }
        }
      } catch (_) {
        // Ignorar errores de red; se reintentará en el próximo ciclo
      }
    };

    const interval = setInterval(checkConfirmed, TX_STATUS_POLL_INTERVAL_MS);
    checkConfirmed(); // primera comprobación al poco de mostrarse el card
    return () => clearInterval(interval);
  }, [pending?.tx_hash]);

  const handleDismiss = useCallback(() => {
    if (pending?.tx_hash) setDismissedHash(pending.tx_hash);
    clearLastSubmittedTx();
    setPending(null);
    setCollapsed(true);
  }, [pending?.tx_hash]);

  const visible = pending && pending.tx_hash !== dismissedHash;
  if (!visible) return null;

  const explorerUrl = pending.explorer_url || `https://preview.cardanoscan.io/transaction/${pending.tx_hash}`;
  const shortHash = pending.tx_hash
    ? `${pending.tx_hash.slice(0, 10)}…${pending.tx_hash.slice(-8)}`
    : '';

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-1"
      role="region"
      aria-label="Última transacción en proceso"
    >
      <div
        className={`
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg
          min-w-0 max-w-[320px] overflow-hidden
          transition-all duration-200
        `}
      >
        {/* Header: always visible, click to expand/collapse */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <LoadingIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {pending.title || 'Transacción en proceso'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {typeof pending.confirmations === 'number' && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {Math.max(0, pending.confirmations)}/{CONFIRMATIONS_THRESHOLD} conf.
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(pending.submitted_at)}
            </span>
          </div>
          <svg
            className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {!collapsed && (
          <div className="px-3 pb-3 pt-0 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Tx ID</span>
              <div className="flex items-center gap-1 min-w-0">
                <CopyToClipboard
                  copyValue={pending.tx_hash}
                  iconClassName="h-4 w-4 text-gray-500 hover:text-gray-700"
                  tooltipLabel="Copiar"
                />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate" title={pending.tx_hash}>
                  {shortHash}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Ver en explorador
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
