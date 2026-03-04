import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from 'flowbite-react';
import Projects from './scripts/Projects';
import Scripts from './scripts/Scripts';
import Card from '../common/Card';
import SignTransactionModal from '../wallet/sign-transaction/SignTransactionModal';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';
import { LoadingIcon } from '../ui-lib';
import { WarningIcon } from '../icons/WarningIcon'
import { InfoIcon } from '../icons/InfoIcon';
import { TailSpin } from 'react-loader-spinner';
import { TrophyIcon } from '../icons/TrophyIcon';
import { getScriptTokenAccess } from '@marketplaces/data-access'
import CopyToClipboard from '../common/CopyToClipboard';
import {
  compileProtocol,
  compileProject,
  mintProtocol,
  mintProject,
  updateProtocol,
  updateProject,
  deployReferenceScript,
  promoteWallet,
  unpromoteWallet,
  getContractDatum,
  burnProtocol,
  burnProject,
  deleteContract,
  type CompileProtocolResponse,
  type GetContractDatumResponse,
  getWalletUtxos,
} from '../common/walletApi';
import { TRANSACTION_CONFIRMED_EVENT } from '../wallet/PendingTransactionFloatingCard';

// Función helper para obtener access token (wallet_session en localStorage)
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = window.localStorage.getItem('wallet_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.access_token || null;
    }
  } catch (err) {
    console.error('Error al obtener el access_token:', err);
  }
  return null;
};

const safeJson = async (response: Response) => {
  // Soporta 204/empty body y respuestas no-JSON sin romper el flujo
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const normalizeToArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.contracts)) return data.contracts;
  if (Array.isArray(data?.available_contracts)) return data.available_contracts;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  // Respuestas anidadas del Wallet API (ej. { data: { contracts: [...] } } o { data: { items: [...] } })
  if (Array.isArray(data?.data?.contracts)) return data.data.contracts;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  // fallback: si viene como objeto (map), convertir a array
  if (typeof data === 'object') return Object.values(data);
  return [];
};

const getPolicyIdFromContract = (c: any): string | null => {
  return (
    c?.policy_id ||
    c?.policyId ||
    c?.policyID ||
    c?.id ||
    c?.policy ||
    null
  );
};

const getContractNameFromContract = (c: any): string | null => {
  return c?.contract_name || c?.contractName || c?.name || c?.title || null;
};

type DecodedAssetName = {
  policyId: string;
  assetNameHex: string;
  fullUtf8: string | null;
  readablePrefix: string | null;
  binaryHex: string | null;
  hasBinary: boolean;
};

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.trim().toLowerCase();
  if (!clean) return new Uint8Array(0);
  if (clean.length % 2 !== 0) {
    throw new Error(`assetNameHex debe tener longitud par, recibido: ${clean.length}`);
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) {
      throw new Error(`Hex inválido en posición ${i}: "${clean.slice(i, i + 2)}"`);
    }
    out[i / 2] = byte;
  }
  return out;
};

const decodeCardanoAsset = (assetId: string): DecodedAssetName => {
  const clean = assetId.trim().toLowerCase();
  if (!clean || clean.length <= 56) {
    throw new Error('Asset ID inválido, se esperan al menos 56 caracteres (policyId + assetName).');
  }

  const policyId = clean.slice(0, 56);
  const assetNameHex = clean.slice(56);
  const bytes = hexToBytes(assetNameHex);

  let readablePart = '';
  let binaryHex = '';

  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      readablePart += String.fromCharCode(byte);
    } else {
      binaryHex += byte.toString(16).padStart(2, '0');
    }
  }

  let fullUtf8: string | null = null;
  if (typeof TextDecoder !== 'undefined' && bytes.length > 0) {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      fullUtf8 = decoder.decode(bytes).replace(/\0+$/g, '') || null;
    } catch {
      fullUtf8 = null;
    }
  }

  return {
    policyId,
    assetNameHex,
    fullUtf8,
    readablePrefix: readablePart || null,
    binaryHex: binaryHex || null,
    hasBinary: binaryHex.length > 0,
  };
};

type ProtocolUtxo = {
  utxoRef: string;
  txHash: string;
  index: number;
  /** ADA en unidades ADA (no lovelace) si viene del API, o calculada */
  ada: number | null;
  address?: string;
  tokensCount?: number;
  tokens?: {
    id: string;
    policyId: string;
    assetNameHex: string;
    assetName: string;
    quantity: number;
  }[];
  raw: any;
};

/** compilation_params suele contener el policy_id del protocolo del que proviene el proyecto */
const getCompilationParamsFromContract = (c: any): string[] => {
  const raw = c?.compilation_params ?? c?.compilationParams;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return [];
};

/** Extrae la dirección testnet del contrato (testnet_address o testnetAddr, string u objeto con .address) */
const getTestnetAddressFromContract = (c: any): string | null => {
  if (!c) return null;
  const raw = c.testnet_address ?? c.testnetAddr;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (raw && typeof (raw as any).address === 'string') return (raw as any).address.trim();
  return null;
};

const getContractTypeFromContract = (c: any): string | null => {
  // en available viene como "minting" o "spending" (lo vamos a inyectar como contract_type)
  return c?.contract_type || c?.contractType || c?.type || null;
};

const getContractTags = (c: any): string[] => {
  if (Array.isArray(c?.tags)) return c.tags.filter(Boolean);
  return [];
};

const getContractCategory = (c: any): string | null => {
  return c?.category || null;
};

const getContractDescription = (c: any): string | null => {
  return c?.description || null;
};

const getContractFilePath = (c: any): string | null => {
  return c?.file_path || c?.filePath || null;
};

type AvailableContractsByType = {
  minting: any[];
  spending: any[];
  total?: number;
};

/** Formulario con estado local para no re-renderizar el modal al escribir y evitar pérdida de foco */
function MintProtocolFormContent(props: {
  policyIdLabel: string;
  onClose: () => void;
  onSubmit: (formData: { protocol_admins?: string[]; protocol_fee: number; destination_address?: string }) => void;
  loading: boolean;
  colors: { fuente: string; bgColor: string; hoverBgColor: string };
}) {
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [newAdminInput, setNewAdminInput] = useState('');
  const [protocolFee, setProtocolFee] = useState('');
  const [protocolDestinationAddress, setProtocolDestinationAddress] = useState('');
  const { onClose, onSubmit, loading, colors } = props;

  const addAdmin = () => {
    const value = newAdminInput.trim();
    if (!value) return;
    if (adminsList.includes(value)) {
      setNewAdminInput('');
      return;
    }
    setAdminsList((prev) => [...prev, value]);
    setNewAdminInput('');
  };

  const removeAdmin = (index: number) => {
    setAdminsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const feeNum = parseInt(protocolFee, 10);
    if (Number.isNaN(feeNum) || feeNum < 0) {
      toast.error('protocol_fee debe ser un número válido (lovelace).');
      return;
    }
    onSubmit({
      protocol_admins: adminsList,
      protocol_fee: feeNum,
      destination_address: protocolDestinationAddress.trim() || undefined,
    });
  };

  return (
    <>
      <Modal.Body className="space-y-4 pt-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">protocol_admins (opcional)</label>
          <div className="w-full border border-gray-300 rounded-lg p-2 min-h-[52px] bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <div className="flex flex-wrap gap-2 mb-2">
              {adminsList.map((admin, index) => (
                <span
                  key={`${admin}-${index}`}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-mono border border-blue-200"
                >
                  <span className="max-w-[140px] truncate" title={admin}>
                    {admin}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAdmin(index)}
                    className="p-0.5 rounded hover:bg-blue-200/80 text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    aria-label="Eliminar admin"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 min-w-0 border-0 p-1.5 text-sm font-mono focus:ring-0 focus:outline-none"
                placeholder="Agregar admin (hash)..."
                value={newAdminInput}
                onChange={(e) => setNewAdminInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAdmin();
                  }
                }}
              />
              <button
                type="button"
                onClick={addAdmin}
                disabled={!newAdminInput.trim()}
                className="shrink-0 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">protocol_fee (lovelace)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={protocolFee}
              onChange={(e) => setProtocolFee(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">destination_address (opcional)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="addr_..."
              value={protocolDestinationAddress}
              onChange={(e) => setProtocolDestinationAddress(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
        <button type="button" className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <LoadingIcon className="w-5 h-5 inline" /> : 'Construir tx y firmar'}
        </button>
      </Modal.Footer>
    </>
  );
}

/** Formulario para mintear tokens de un proyecto específico */
function MintProjectFormContent(props: {
  projectNameLabel: string;
  policyIdLabel: string;
  onClose: () => void;
  onSubmit: (formData: {
    investment_tokens: number;
    project_id: string;
    destination_address: string;
    stakeholders: { participation: number; pkh: string; stakeholder: string }[];
  }) => void;
  loading: boolean;
  colors: { fuente: string; bgColor: string; hoverBgColor: string };
}) {
  const [investmentTokens, setInvestmentTokens] = useState('');
  const [projectId, setProjectId] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [stakeholderPkh, setStakeholderPkh] = useState('');
  const [stakeholderParticipation, setStakeholderParticipation] = useState('');
  const [stakeholderHex, setStakeholderHex] = useState('');
  const { onClose, onSubmit, loading, colors } = props;

  const handleSubmit = () => {
    const invTokensNum = parseInt(investmentTokens, 10);
    if (Number.isNaN(invTokensNum) || invTokensNum <= 0) {
      toast.error('investment_tokens debe ser un número entero positivo.');
      return;
    }
    const projId = projectId.trim();
    const destAddr = destinationAddress.trim();

    const stakeholders: { participation: number; pkh: string; stakeholder: string }[] = [];
    const pkh = stakeholderPkh.trim();
    const stakeholder = stakeholderHex.trim();
    const participationNum = parseInt(stakeholderParticipation, 10);
    if (pkh && stakeholder && !Number.isNaN(participationNum) && participationNum > 0) {
      stakeholders.push({ participation: participationNum, pkh, stakeholder });
    }

    onSubmit({
      investment_tokens: invTokensNum,
      project_id: projId,
      destination_address: destAddr,
      stakeholders,
    });
  };

  return (
    <>
      <Modal.Body className="space-y-4 pt-4">
        <p className="text-sm text-gray-600">
          Configura los parámetros para mintear los tokens de este proyecto. Los campos numéricos se expresan en unidades enteras (por ejemplo, lovelace).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              investment_tokens
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100000"
              value={investmentTokens}
              onChange={(e) => setInvestmentTokens(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              project_id (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0a1b2c3d..."
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            destination_address
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="addr_test1..."
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <p className="sm:col-span-3 text-xs text-gray-500">
            Stakeholders (opcional): si completas los tres campos se agregará uno; si los dejas vacíos se minteará sin stakeholders.
          </p>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Stakeholder pkh (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="fe2d2b5b..."
              value={stakeholderPkh}
              onChange={(e) => setStakeholderPkh(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Participación (lovelace, opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="500000"
              value={stakeholderParticipation}
              onChange={(e) => setStakeholderParticipation(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              stakeholder (nombre en hex, opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="6c616e646f776e6572"
              value={stakeholderHex}
              onChange={(e) => setStakeholderHex(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-2 text-[11px] text-gray-600 flex flex-col gap-1">
          <div>
            <span className="font-semibold">Proyecto:</span>{' '}
            <span>{props.projectNameLabel || '—'}</span>
          </div>
          <div>
            <span className="font-semibold">policy_id:</span>{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">
              {props.policyIdLabel}
            </code>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
        <button
          type="button"
          className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <LoadingIcon className="w-5 h-5 inline" /> : 'Mintear tokens'}
        </button>
      </Modal.Footer>
    </>
  );
}

function UpdateProtocolFormContent(props: {
  policyIdLabel: string;
  onClose: () => void;
  onSubmit: (formData: {
    oracle_id: string;
    protocol_fee: number;
    protocol_admins?: string[];
  }) => void;
  loading: boolean;
  colors: { fuente: string; bgColor: string; hoverBgColor: string };
  /** Datum actual del contrato (project_admins = protocol_admins en backend) para pre-rellenar el formulario */
  initialDatum?: { oracle_id?: string; protocol_fee?: number; project_admins?: string[] };
}) {
  const { onClose, onSubmit, loading, colors, initialDatum } = props;
  const [oracleId, setOracleId] = useState(initialDatum?.oracle_id ?? '');
  const [protocolFee, setProtocolFee] = useState(String(initialDatum?.protocol_fee ?? ''));
  const [adminsList, setAdminsList] = useState<string[]>(initialDatum?.project_admins ?? []);
  const [newAdminInput, setNewAdminInput] = useState('');

  useEffect(() => {
    if (initialDatum) {
      setOracleId(initialDatum.oracle_id ?? '');
      setProtocolFee(String(initialDatum.protocol_fee ?? ''));
      setAdminsList(initialDatum.project_admins ?? []);
    }
  }, [initialDatum]);

  const addAdmin = () => {
    const value = newAdminInput.trim();
    if (!value) return;
    if (adminsList.includes(value)) {
      setNewAdminInput('');
      return;
    }
    setAdminsList((prev) => [...prev, value]);
    setNewAdminInput('');
  };

  const removeAdmin = (index: number) => {
    setAdminsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const feeNum = parseInt(protocolFee, 10);
    if (Number.isNaN(feeNum) || feeNum <= 0) {
      toast.error('protocol_fee debe ser un número entero positivo (en lovelace).');
      return;
    }
    onSubmit({
      oracle_id: oracleId.trim(),
      protocol_fee: feeNum,
      protocol_admins: adminsList,
    });
  };

  return (
    <>
      <Modal.Body className="space-y-4 pt-4">
        <p className="text-sm text-gray-600">
          Actualiza los parámetros del protocolo. El monto de <code>protocol_fee</code> se expresa en lovelace.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              oracle_id (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="oracle id..."
              value={oracleId}
              onChange={(e) => setOracleId(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              protocol_fee (lovelace)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="3000000"
              value={protocolFee}
              onChange={(e) => setProtocolFee(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              protocol_admins (opcional)
            </label>
            <div className="w-full border border-gray-300 rounded-lg p-2 min-h-[52px] bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <div className="flex flex-wrap gap-2 mb-2">
                {adminsList.map((admin, index) => (
                  <span
                    key={`${admin}-${index}`}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-mono border border-blue-200"
                  >
                    <span className="max-w-[140px] truncate" title={admin}>
                      {admin}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAdmin(index)}
                      className="p-0.5 rounded hover:bg-blue-200/80 text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      aria-label="Eliminar admin"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 min-w-0 border-0 p-1.5 text-sm font-mono focus:ring-0 focus:outline-none"
                  placeholder="Agregar admin (hash)..."
                  value={newAdminInput}
                  onChange={(e) => setNewAdminInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAdmin();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addAdmin}
                  disabled={!newAdminInput.trim()}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-2 text-[11px] text-gray-600 flex flex-col gap-1">
              <div>
                <span className="font-semibold">policy_id:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                  {props.policyIdLabel}
                </code>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
        <button
          type="button"
          className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <LoadingIcon className="w-5 h-5 inline" /> : 'Actualizar protocolo'}
        </button>
      </Modal.Footer>
    </>
  );
}

type ProjectDatumForForm = {
  params?: { project_id?: string; project_metadata?: string; project_state?: number };
  project_token?: { policy_id?: string; token_name?: string; total_supply?: number };
  certifications?: Array<{ certification_date?: number; quantity?: number; real_certification_date?: number; real_quantity?: number }>;
  stakeholders?: Array<{ pkh?: string; stakeholder?: string; participation?: number }>;
};

function UpdateProjectFormContent(props: {
  projectNameLabel: string;
  policyIdLabel: string;
  defaultProjectTokenPolicyId?: string;
  onClose: () => void;
  onSubmit: (formData: {
    project_id: string;
    project_metadata: string;
    project_state: number;
    project_token_name: string;
    project_token_policy_id: string;
    total_supply: number;
    certification_date: number;
    quantity: number;
    real_certification_date: number;
    real_quantity: number;
    stakeholder_pkh: string;
    stakeholder_hex: string;
    stakeholder_participation: number;
  }) => void;
  loading: boolean;
  colors: { fuente: string; bgColor: string; hoverBgColor: string };
  /** Datum actual del contrato de proyecto para pre-rellenar el formulario */
  initialDatum?: ProjectDatumForForm;
}) {
  const { onClose, onSubmit, loading, colors, initialDatum } = props;
  const p = initialDatum?.params;
  const pt = initialDatum?.project_token;
  const cert0 = initialDatum?.certifications?.[0];
  const stake0 = initialDatum?.stakeholders?.[0];
  const [projectId, setProjectId] = useState(p?.project_id ?? '');
  const [projectMetadata, setProjectMetadata] = useState(p?.project_metadata ?? '');
  const [projectState, setProjectState] = useState(String(p?.project_state ?? ''));
  const [projectTokenName, setProjectTokenName] = useState(pt?.token_name ?? '');
  const [projectTokenPolicyId, setProjectTokenPolicyId] = useState(
    pt?.policy_id ?? props.defaultProjectTokenPolicyId ?? ''
  );
  const [totalSupply, setTotalSupply] = useState(String(pt?.total_supply ?? ''));
  const [certificationDate, setCertificationDate] = useState(String(cert0?.certification_date ?? ''));
  const [quantity, setQuantity] = useState(String(cert0?.quantity ?? ''));
  const [realCertificationDate, setRealCertificationDate] = useState(String(cert0?.real_certification_date ?? ''));
  const [realQuantity, setRealQuantity] = useState(String(cert0?.real_quantity ?? ''));
  const [stakeholderPkh, setStakeholderPkh] = useState(stake0?.pkh ?? '');
  const [stakeholderParticipation, setStakeholderParticipation] = useState(String(stake0?.participation ?? ''));
  const [stakeholderHex, setStakeholderHex] = useState(stake0?.stakeholder ?? '');

  useEffect(() => {
    if (initialDatum) {
      const p0 = initialDatum.params;
      const pt0 = initialDatum.project_token;
      const c0 = initialDatum.certifications?.[0];
      const s0 = initialDatum.stakeholders?.[0];
      if (p0) {
        setProjectId(p0.project_id ?? '');
        setProjectMetadata(p0.project_metadata ?? '');
        setProjectState(String(p0.project_state ?? ''));
      }
      if (pt0) {
        setProjectTokenName(pt0.token_name ?? '');
        setProjectTokenPolicyId(pt0.policy_id ?? props.defaultProjectTokenPolicyId ?? '');
        setTotalSupply(String(pt0.total_supply ?? ''));
      }
      if (c0) {
        setCertificationDate(String(c0.certification_date ?? ''));
        setQuantity(String(c0.quantity ?? ''));
        setRealCertificationDate(String(c0.real_certification_date ?? ''));
        setRealQuantity(String(c0.real_quantity ?? ''));
      }
      if (s0) {
        setStakeholderPkh(s0.pkh ?? '');
        setStakeholderParticipation(String(s0.participation ?? ''));
        setStakeholderHex(s0.stakeholder ?? '');
      }
    }
  }, [initialDatum, props.defaultProjectTokenPolicyId]);

  const handleSubmit = () => {
    const projId = projectId.trim();
    if (!projId) {
      toast.error('project_id es obligatorio.');
      return;
    }
    const tokenName = projectTokenName.trim();
    if (!tokenName) {
      toast.error('project_token_name es obligatorio (en hex).');
      return;
    }
    const tokenPolicyId = projectTokenPolicyId.trim();
    if (!tokenPolicyId) {
      toast.error('project_token_policy_id es obligatorio.');
      return;
    }
    const totalSupplyNum = parseInt(totalSupply, 10);
    if (Number.isNaN(totalSupplyNum) || totalSupplyNum <= 0) {
      toast.error('total_supply debe ser un entero positivo.');
      return;
    }
    const stateNum = parseInt(projectState, 10);
    if (Number.isNaN(stateNum)) {
      toast.error('project_state debe ser un número entero.');
      return;
    }
    const certDateNum = parseInt(certificationDate || '0', 10);
    const qtyNum = parseInt(quantity || '0', 10);
    const realCertDateNum = parseInt(realCertificationDate || '0', 10);
    const realQtyNum = parseInt(realQuantity || '0', 10);
    const pkh = stakeholderPkh.trim();
    const stakeholder = stakeholderHex.trim();
    const participationNum = parseInt(stakeholderParticipation || '0', 10);
    if (!pkh || !stakeholder || Number.isNaN(participationNum) || participationNum <= 0) {
      toast.error('Debes indicar un stakeholder válido (pkh, nombre en hex y participación).');
      return;
    }

    onSubmit({
      project_id: projId,
      project_metadata: projectMetadata,
      project_state: stateNum,
      project_token_name: tokenName,
      project_token_policy_id: tokenPolicyId,
      total_supply: totalSupplyNum,
      certification_date: Number.isNaN(certDateNum) ? 0 : certDateNum,
      quantity: Number.isNaN(qtyNum) ? 0 : qtyNum,
      real_certification_date: Number.isNaN(realCertDateNum) ? 0 : realCertDateNum,
      real_quantity: Number.isNaN(realQtyNum) ? 0 : realQtyNum,
      stakeholder_pkh: pkh,
      stakeholder_hex: stakeholder,
      stakeholder_participation: participationNum,
    });
  };

  return (
    <>
      <Modal.Body className="space-y-4 pt-4">
        <p className="text-sm text-gray-600">
          Actualiza los parámetros on-chain de este proyecto. Los campos numéricos se expresan en unidades enteras.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              project_id
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0a1b2c3d..."
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              project_state
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
              value={projectState}
              onChange={(e) => setProjectState(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              total_supply
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="500000"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              project_metadata (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="{}"
              value={projectMetadata}
              onChange={(e) => setProjectMetadata(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              project_token_name (hex)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="475245595f..."
              value={projectTokenName}
              onChange={(e) => setProjectTokenName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              project_token_policy_id
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="abc123..."
              value={projectTokenPolicyId}
              onChange={(e) => setProjectTokenPolicyId(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              certification_date (epoch, opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1700000000"
              value={certificationDate}
              onChange={(e) => setCertificationDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              quantity (certificación, opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              real_certification_date (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={realCertificationDate}
              onChange={(e) => setRealCertificationDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              real_quantity (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={realQuantity}
              onChange={(e) => setRealQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Stakeholder pkh
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="fe2d2b5b..."
              value={stakeholderPkh}
              onChange={(e) => setStakeholderPkh(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Stakeholder participación (lovelace)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="500000"
              value={stakeholderParticipation}
              onChange={(e) => setStakeholderParticipation(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              stakeholder (nombre en hex)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="6c616e646f776e6572"
              value={stakeholderHex}
              onChange={(e) => setStakeholderHex(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-2 text-[11px] text-gray-600 flex flex-col gap-1">
              <div>
                <span className="font-semibold">Proyecto:</span>{' '}
                <span>{props.projectNameLabel || '—'}</span>
              </div>
              <div>
                <span className="font-semibold">policy_id (contrato):</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                  {props.policyIdLabel}
                </code>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
        <button
          type="button"
          className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <LoadingIcon className="w-5 h-5 inline" /> : 'Actualizar proyecto'}
        </button>
      </Modal.Footer>
    </>
  );
}

/** Formulario con estado local para no re-renderizar el modal al escribir y evitar pérdida de foco */
function CreateProjectFormContent(props: {
  protocolPolicyIdLabel: string;
  onClose: () => void;
  onSubmit: (projectName: string) => void;
  loading: boolean;
  colors: { fuente: string; bgColor: string; hoverBgColor: string };
}) {
  const [projectName, setProjectName] = useState('');
  const { onClose, onSubmit, loading, colors } = props;

  const handleSubmit = () => {
    const name = projectName.trim();
    if (!name) {
      toast.error('El nombre del proyecto es obligatorio (ej. reforestation_guaviare).');
      return;
    }
    onSubmit(name);
  };

  return (
    <>
      <Modal.Body className="space-y-4 pt-4">
        <p className="text-sm text-gray-600">
          Un mismo protocolo puede albergar múltiples proyectos. Indica un nombre único para este proyecto (ej. reforestation_guaviare).
        </p>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Nombre del proyecto (project_name)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="reforestation_guaviare"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
        <button type="button" className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
          onClick={handleSubmit}
          disabled={loading || !projectName.trim()}
        >
          {loading ? <LoadingIcon className="w-5 h-5 inline" /> : 'Compilar proyecto'}
        </button>
      </Modal.Footer>
    </>
  );
}

export default function CoreWallet(props: any) {
  const { walletID, walletAddress, walletData } =
    useContext<any>(WalletContext);
  const [oracleWalletLovelaceBalance, setOracleWalletLovelaceBalance] =
    useState<number | null>(null);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>({
    transfer: false,
    query: false,
  });
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [adaToSend, setAdaToSend] = useState<string>('');
  const [loadingSendTokenAccess, setLoadingSendTokenAccess] = useState(false)
  const [sendTokenAcces, setSendTokenAccess] = useState(false)
  const [hasTokenAcces, setHasTokenAccess] = useState(false)

  const [availableContractsByType, setAvailableContractsByType] = useState<AvailableContractsByType>({
    minting: [],
    spending: [],
    total: 0,
  });
  const [compiledContracts, setCompiledContracts] = useState<any[]>([]);
  const [contractsLastSyncAt, setContractsLastSyncAt] = useState<number | null>(null);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contractActionLoadingKey, setContractActionLoadingKey] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [contractSearch, setContractSearch] = useState<string>('');

  // Protocol flow: Compile → Mint → Sign Submit
  const [protocolCompileResult, setProtocolCompileResult] = useState<CompileProtocolResponse | null>(null);
  const [protocolCompileLoading, setProtocolCompileLoading] = useState(false);
  const [protocolMintLoading, setProtocolMintLoading] = useState(false);
  const [protocolUtxoModalOpen, setProtocolUtxoModalOpen] = useState(false);
  const [protocolUtxosLoading, setProtocolUtxosLoading] = useState(false);
  const [protocolUtxos, setProtocolUtxos] = useState<ProtocolUtxo[]>([]);
  const [selectedProtocolUtxoRef, setSelectedProtocolUtxoRef] = useState<string | null>(null);
  const [protocolUtxosError, setProtocolUtxosError] = useState<string | null>(null);
  const [signType, setSignType] = useState<string>('sendTransaction');
  const [mintedProtocolPolicyIds, setMintedProtocolPolicyIds] = useState<Set<string>>(new Set());
  const [selectedProtocolPolicyId, setSelectedProtocolPolicyId] = useState<string | null>(null);
  const lastMintPolicyIdRef = useRef<string | null>(null);
  const [mintedProjectPolicyIds, setMintedProjectPolicyIds] = useState<Set<string>>(new Set());
  const lastMintProjectPolicyIdRef = useRef<string | null>(null);
  const pendingDeleteAfterSignRef = useRef<{ policyIdToDelete: string; burnTxId: string } | null>(null);
  const [updateProtocolModalPolicyId, setUpdateProtocolModalPolicyId] = useState<string | null>(null);
  const [updateProtocolLoading, setUpdateProtocolLoading] = useState(false);
  // Crear contrato de proyecto a partir de un protocolo minteado
  const [protocolPolicyIdForNewProject, setProtocolPolicyIdForNewProject] = useState<string | null>(null);
  const [compileProjectLoading, setCompileProjectLoading] = useState(false);
  // Deploy reference script: policy_id del proyecto en curso para mostrar loading en su botón
  const [deployLoadingPolicyId, setDeployLoadingPolicyId] = useState<string | null>(null);
  // Dropdown de proyectos por protocolo: policy_id del protocolo desplegado (solo uno abierto)
  const [expandedProtocolPolicyId, setExpandedProtocolPolicyId] = useState<string | null>(null);
  // Modal Deploy: contrato seleccionado y dirección destino (se pide en el modal)
  const [deployModalContract, setDeployModalContract] = useState<any | null>(null);
  const [deployModalDestinationAddress, setDeployModalDestinationAddress] = useState<string>('');
  // Mint project tokens: contrato seleccionado y loading por policy_id
  const [mintProjectModalContract, setMintProjectModalContract] = useState<any | null>(null);
  const [mintProjectLoadingPolicyId, setMintProjectLoadingPolicyId] = useState<string | null>(null);
  const [updateProjectModalContract, setUpdateProjectModalContract] = useState<any | null>(null);
  const [updateProjectLoadingPolicyId, setUpdateProjectLoadingPolicyId] = useState<string | null>(null);
  // Datum del contrato spending (protocolo): por policy_id (carga al listar) y modal para detalle
  const [datumByPolicyId, setDatumByPolicyId] = useState<
    Record<string, { data: GetContractDatumResponse | null; loading: boolean; error: string | null }>
  >({});
  const [datumModalSpendingPolicyId, setDatumModalSpendingPolicyId] = useState<string | null>(null);
  const [datumLoading, setDatumLoading] = useState(false);
  const [datumData, setDatumData] = useState<GetContractDatumResponse | null>(null);
  const [datumError, setDatumError] = useState<string | null>(null);
  // Core wallet management: wallet_id arbitrario que se quiere promover / despromover
  const [coreWalletIdInput, setCoreWalletIdInput] = useState<string>('');

  useEffect(() => {
    if (!hasTokenAcces && walletData) {
      const hasAsset = walletData.assets.some((asset: any) => asset.asset_name === 'SandboxSuanAccess1')

      if (hasAsset) {
        setSendTokenAccess(false)
        setHasTokenAccess(true)
      }
    }
  }, [walletData])

  // Al abrir el modal de datum, usar dato ya cargado o cargar bajo demanda
  useEffect(() => {
    if (!datumModalSpendingPolicyId) {
      setDatumData(null);
      setDatumError(null);
      return;
    }
    const cached = datumByPolicyId[datumModalSpendingPolicyId];
    if (cached?.data) {
      setDatumData(cached.data);
      setDatumError(null);
      setDatumLoading(false);
      return;
    }
    if (cached?.error) {
      setDatumData(null);
      setDatumError(cached.error);
      setDatumLoading(false);
      return;
    }
    let cancelled = false;
    setDatumLoading(true);
    setDatumError(null);
    getContractDatum(datumModalSpendingPolicyId).then((result) => {
      if (cancelled) return;
      setDatumLoading(false);
      if (result.success && result.data) {
        setDatumData(result.data);
        setDatumError(null);
      } else {
        setDatumData(null);
        setDatumError(result.error || 'Error al obtener el datum');
      }
    });
    return () => { cancelled = true; };
  }, [datumModalSpendingPolicyId, datumByPolicyId]);

  const getWalletBalanceByAddress = async (address: any) => {
    const balanceFetchResponse = await fetch(
      '/api/calls/backend/getWalletBalanceByAddress',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      }
    );

    const balanceData = await balanceFetchResponse.json();
    return balanceData.balance;
  };

  const configureMarketplace = async () => {
    setLoadingSendTokenAccess(true)

    const payload = {
      walletID: walletID,
      walletAddress: walletAddress
    }

    try {
      const request = await fetch('/api/marketplace/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const response = await request.json();
      if (response) {
        setSendTokenAccess(true)
      }

      console.log('Respuesta de configuración de marketplace: ', response)
    } catch (error) {
      console.log(`Error configurando marketplace ${error}`)
    } finally {
      setLoadingSendTokenAccess(false)

    }
  }

  const generateTokenAccess = async () => {
    const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/helpers/send-access-token/?wallet_id=${walletID}&destinAddress=${walletAddress}&marketplace_id=${process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLocaleLowerCase()}&save_flag=true`
    setLoadingSendTokenAccess(true)
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || ''
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('data received', data);
      setSendTokenAccess(true)
      return data;
    } catch (error) {
      console.error('Error fetching token access:', error);
      throw error;
    } finally {
      setLoadingSendTokenAccess(false)
    }
  }

  const handleGetOracleWalletLovelaceBalance = async () => {
    setIsLoading((prevState: any) => ({
      ...prevState,
      query: true,
    }));
    const lovelaceAmount = await getWalletBalanceByAddress(
      'addr_test1vrvyzwdky7hf7rqsnc3v69lr604tprdp3uyvkc0wqmrwmgqsgss8y'
    );

    setOracleWalletLovelaceBalance(lovelaceAmount);

    setIsLoading((prevState: any) => ({
      ...prevState,
      query: false,
    }));
  };

  const handleOpenSignTransactionModal = (signStatus?: boolean) => {
    if (signStatus === true) {
      if (lastMintPolicyIdRef.current) {
        setMintedProtocolPolicyIds((prev) => new Set(prev).add(lastMintPolicyIdRef.current!));
        lastMintPolicyIdRef.current = null;
      }
      if (lastMintProjectPolicyIdRef.current) {
        setMintedProjectPolicyIds((prev) => new Set(prev).add(lastMintProjectPolicyIdRef.current!));
        lastMintProjectPolicyIdRef.current = null;
      }
      // No llamar DELETE aquí: se ejecutará cuando la tx de burn esté confirmada (TRANSACTION_CONFIRMED_EVENT)
    } else {
      pendingDeleteAfterSignRef.current = null;
    }
    setSignTransactionModal((open) => !open);
  };

  // Cuando la tx de burn se confirma en blockchain, ejecutar DELETE del contrato
  useEffect(() => {
    const onTransactionConfirmed = (e: Event) => {
      const txHash = (e as CustomEvent<{ tx_hash?: string }>)?.detail?.tx_hash;
      const pending = pendingDeleteAfterSignRef.current;
      if (!pending || !txHash || pending.burnTxId !== txHash) return;
      pendingDeleteAfterSignRef.current = null;
      (async () => {
        const result = await deleteContract(pending.policyIdToDelete);
        if (result.success) {
          toast.success('Contrato eliminado correctamente.');
          await refreshContracts(true);
        } else {
          toast.error(result.error || 'Error al eliminar el contrato');
        }
      })();
    };
    window.addEventListener(TRANSACTION_CONFIRMED_EVENT, onTransactionConfirmed);
    return () => window.removeEventListener(TRANSACTION_CONFIRMED_EVENT, onTransactionConfirmed);
  }, []);

  const handleSendTransaction = async () => {
    setIsLoading((prevState: any) => ({
      ...prevState,
      transfer: true,
    }));

    if (parseFloat(adaToSend) <= 0) {
      toast.error(
        'Debes agregar una cantidad de ADAs valida para poder enviar.'
      );
      return;
    }

    const payload = {
      payload: {
        wallet_id: walletID,
        addresses: [
          {
            address:
              'addr_test1vrvyzwdky7hf7rqsnc3v69lr604tprdp3uyvkc0wqmrwmgqsgss8y', // Remplazar por billetera oraculo del marketplace
            lovelace: parseFloat(adaToSend) * 1000000,
            multiAsset: [],
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletID,
        walletAddress: walletAddress,
      },
    };
    if (walletData) {
      console.log('BuildTx Payload: ', payload);

      const request = await fetch('/api/transactions/build-tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const buildTxResponse = await request.json();
      console.log('BuildTx Response: ', buildTxResponse);

      if (buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletData.address,
          buildTxResponse: buildTxResponse,
          metadata: {},
        });

        setNewTransactionBuild({
          ...mappedTransactionData,
          transaction_id: buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal();
      } else {
        toast.error(
          <span className={colors.fuente}>Algo ha salido mal, revisa las direcciones de billetera ..</span>
        );
      }
    }
    setIsLoading((prevState: any) => ({
      ...prevState,
      transfer: false,
    }));
  };

  const openProtocolCompileModal = async () => {
    if (!walletID) {
      toast.error('Debes tener una billetera activa para compilar el protocolo.');
      return;
    }

    setProtocolUtxoModalOpen(true);
    setProtocolUtxos([]);
    setSelectedProtocolUtxoRef(null);
    setProtocolUtxosError(null);
    setProtocolUtxosLoading(true);

    try {
      const result = await getWalletUtxos(walletID);
      if (!result.success || !result.data) {
        setProtocolUtxos([]);
        return;
      }

      const rawUtxos = (result.data as any).utxos ?? result.data;
      const asArray = normalizeToArray(rawUtxos);

      const mapped: ProtocolUtxo[] = asArray
        .map((u: any) => {
          const txHash: string = u.tx_hash ?? '';
          const index: number = u.output_index ?? 0;
          const utxoRef: string | undefined =
            u.utxo_ref || (txHash ? `${txHash}:${index}` : undefined);

          const ada: number | null =
            typeof u.amount_ada === 'number' ? u.amount_ada : null;

          if (!utxoRef) return null;

          let tokens:
            | {
                id: string;
                policyId: string;
                assetNameHex: string;
                assetName: string;
                quantity: number;
              }[]
            | undefined;
          let tokensCount: number | undefined;
          if (u.tokens && typeof u.tokens === 'object') {
            const entries = Object.entries(u.tokens as Record<string, any>);
            tokens = entries.map(([id, qty]) => {
              const decoded = decodeCardanoAsset(id);
              const displayName =
                decoded.readablePrefix ||
                decoded.fullUtf8 ||
                (decoded.assetNameHex ? decoded.assetNameHex.slice(0, 10) + '…' : '');
              return {
                id,
                policyId: decoded.policyId,
                assetNameHex: decoded.assetNameHex,
                assetName: displayName,
                quantity: typeof qty === 'number' ? qty : Number(qty ?? 0),
              };
            });
            tokensCount = tokens.length;
          }

          return {
            utxoRef,
            txHash,
            index,
            ada,
            address: u.address,
            tokensCount,
            tokens,
            raw: u,
          } as ProtocolUtxo;
        })
        .filter(Boolean) as ProtocolUtxo[];

      setProtocolUtxos(mapped);
    } catch (error) {
      console.error('Error al cargar UTXOs para compilar protocolo:', error);
      setProtocolUtxos([]);
      setProtocolUtxosError('No se pudieron cargar los UTXOs de la billetera.');
    } finally {
      setProtocolUtxosLoading(false);
    }
  };

  const handleCompileProtocol = async (utxoRef: string): Promise<boolean> => {
    setProtocolCompileLoading(true);
    setProtocolCompileResult(null);
    try {
      const result = await compileProtocol({ utxo_ref: utxoRef });
      if (result.success && result.data) {
        setProtocolCompileResult(result.data);
        toast.success(result.data.message || 'Protocolo compilado correctamente.');
        refreshContracts(true);
        return true;
      }
      return false;
    } finally {
      setProtocolCompileLoading(false);
    }
  };

  const handleMintProtocol = async (
    policyIdFromRow?: string,
    formData?: { protocol_admins?: string[]; protocol_fee: number; destination_address?: string }
  ) => {
    const policyId = policyIdFromRow ?? selectedProtocolPolicyId ?? protocolCompileResult?.protocol_nfts?.policy_id;
    if (!policyId) {
      toast.error('Selecciona un contrato protocolo (policy_id) para mintear.');
      return;
    }
    if (!formData) {
      toast.error('Completa el formulario (protocol_fee es obligatorio).');
      return;
    }
    const feeNum = formData.protocol_fee;
    if (Number.isNaN(feeNum) || feeNum < 0) {
      toast.error('protocol_fee debe ser un número válido (lovelace).');
      return;
    }
    setProtocolMintLoading(true);
    try {
      const result = await mintProtocol(policyId, {
        protocol_admins: formData.protocol_admins ?? [],
        protocol_fee: feeNum,
        destination_address: formData.destination_address,
      });
      if (result.success && result.data) {
        const d = result.data;
        lastMintPolicyIdRef.current = policyId;
        setNewTransactionBuild({
          transaction_id: d.transaction_id,
          title: 'Mint protocolo',
          subtitle: d.protocol_contract_address || d.transaction_id,
          tx_id: d.transaction_id,
          tx_type: 'mint_protocol',
          tx_fee: (d.fee_lovelace / 1_000_000).toFixed(6),
          tx_value: '0',
          tx_assets: [],
          block: 0,
          tx_size: 0,
          inputUTxOs: Array.isArray(d.inputs) ? d.inputs : [],
          outputUTxOs: Array.isArray(d.outputs) ? d.outputs : [],
          metadata: {},
          _mintProtocolPolicyId: policyId,
        });
        setSignType('sendTransaction');
        setSignTransactionModal(true);
        // Cerrar modal de minteo de protocolo tras construir la transacción
        setSelectedProtocolPolicyId(null);
        setProtocolCompileResult(null);
      }
    } finally {
      setProtocolMintLoading(false);
    }
  };

  const handleMintProject = async (
    projectContract: any,
    formData: {
      investment_tokens: number;
      project_id: string;
      destination_address: string;
      stakeholders: { participation: number; pkh: string; stakeholder: string }[];
    }
  ) => {
    const policyId =
      getPolicyIdFromContract(projectContract) || projectContract?.policy_id;
    if (!policyId) {
      toast.error('No se pudo determinar el policy_id del contrato de proyecto.');
      return;
    }

    setMintProjectLoadingPolicyId(policyId);
    try {
      const result = await mintProject(policyId, {
        investment_tokens: formData.investment_tokens,
        project_id: formData.project_id,
        destination_address: formData.destination_address,
        stakeholders: formData.stakeholders,
      });

      if (result.success && result.data) {
        const d = result.data;
        lastMintProjectPolicyIdRef.current = policyId;
        setNewTransactionBuild({
          transaction_id: d.transaction_id,
          title: 'Mint proyecto',
          subtitle: d.project_contract_address || d.transaction_id,
          tx_id: d.transaction_id,
          tx_type: 'mint_project',
          tx_fee: (d.fee_lovelace / 1_000_000).toFixed(6),
          tx_value: '0',
          tx_assets: [],
          block: 0,
          tx_size: 0,
          inputUTxOs: Array.isArray(d.inputs) ? d.inputs : [],
          outputUTxOs: Array.isArray(d.outputs) ? d.outputs : [],
          metadata: {},
        });
        setSignType('sendTransaction');
        setSignTransactionModal(true);
      }
    } finally {
      setMintProjectLoadingPolicyId(null);
    }
  };

  const handleUpdateProtocol = async (
    protocolPolicyId: string,
    formData: {
      oracle_id: string;
      protocol_fee: number;
      protocol_admins?: string[];
    }
  ) => {
    setUpdateProtocolLoading(true);
    try {
      const result = await updateProtocol(protocolPolicyId, {
        oracle_id: formData.oracle_id,
        projects: [],
        protocol_admins: formData.protocol_admins ?? [],
        protocol_fee: formData.protocol_fee,
      });
      if (result.success && result.data) {
        const d = result.data;
        setNewTransactionBuild({
          transaction_id: d.transaction_id,
          title: 'Actualizar protocolo',
          subtitle: d.protocol_contract_address || d.transaction_id,
          tx_id: d.transaction_id,
          tx_type: 'update_protocol',
          tx_fee: (d.fee_lovelace / 1_000_000).toFixed(6),
          tx_value: '0',
          tx_assets: [],
          block: 0,
          tx_size: 0,
          inputUTxOs: Array.isArray(d.inputs) ? d.inputs : [],
          outputUTxOs: Array.isArray(d.outputs) ? d.outputs : [],
          metadata: {},
        });
        setSignType('sendTransaction');
        setSignTransactionModal(true);
      }
    } finally {
      setUpdateProtocolLoading(false);
      setUpdateProtocolModalPolicyId(null);
    }
  };

  const handleUpdateProject = async (
    projectContract: any,
    formData: {
      project_id: string;
      project_metadata: string;
      project_state: number;
      project_token_name: string;
      project_token_policy_id: string;
      total_supply: number;
      certification_date: number;
      quantity: number;
      real_certification_date: number;
      real_quantity: number;
      stakeholder_pkh: string;
      stakeholder_hex: string;
      stakeholder_participation: number;
    }
  ) => {
    const policyId =
      getPolicyIdFromContract(projectContract) || projectContract?.policy_id;
    if (!policyId) {
      toast.error('No se pudo determinar el policy_id del contrato de proyecto.');
      return;
    }

    setUpdateProjectLoadingPolicyId(policyId);
    try {
      const result = await updateProject(policyId, {
        certifications: [
          {
            certification_date: formData.certification_date,
            quantity: formData.quantity,
            real_certification_date: formData.real_certification_date,
            real_quantity: formData.real_quantity,
          },
        ],
        project_id: formData.project_id,
        project_metadata: formData.project_metadata,
        project_state: formData.project_state,
        project_token_name: formData.project_token_name,
        project_token_policy_id: formData.project_token_policy_id,
        stakeholders: [
          {
            participation: formData.stakeholder_participation,
            pkh: formData.stakeholder_pkh,
            stakeholder: formData.stakeholder_hex,
          },
        ],
        total_supply: formData.total_supply,
      });

      if (result.success && result.data) {
        const d = result.data;
        setNewTransactionBuild({
          transaction_id: d.transaction_id,
          title: 'Actualizar proyecto',
          subtitle: d.project_contract_address || d.transaction_id,
          tx_id: d.transaction_id,
          tx_type: 'update_project',
          tx_fee: (d.fee_lovelace / 1_000_000).toFixed(6),
          tx_value: '0',
          tx_assets: [],
          block: 0,
          tx_size: 0,
          inputUTxOs: Array.isArray(d.inputs) ? d.inputs : [],
          outputUTxOs: Array.isArray(d.outputs) ? d.outputs : [],
          metadata: {},
        });
        setSignType('sendTransaction');
        setSignTransactionModal(true);
      }
    } finally {
      setUpdateProjectLoadingPolicyId(null);
      setUpdateProjectModalContract(null);
    }
  };

  const handleCompileProject = async (projectName?: string) => {
    if (!protocolPolicyIdForNewProject) {
      toast.error('Selecciona un protocolo minteado para crear el proyecto.');
      return;
    }
    const name = (projectName ?? '').trim();
    if (!name) {
      toast.error('El nombre del proyecto es obligatorio (ej. reforestation_guaviare).');
      return;
    }
    setCompileProjectLoading(true);
    try {
      const result = await compileProject({
        project_name: name,
        protocol_nfts_policy_id: protocolPolicyIdForNewProject,
      });
      if (result.success && result.data) {
        toast.success(result.data.message || 'Proyecto compilado correctamente.');
        setProtocolPolicyIdForNewProject(null);
        await refreshContracts(true);
      }
    } finally {
      setCompileProjectLoading(false);
    }
  };

  const handleDeployProject = async (projectContract: any, destinationAddress?: string) => {
    const policyId = getPolicyIdFromContract(projectContract) || projectContract?.policy_id;
    if (!policyId) {
      toast.error('El contrato del proyecto no tiene policy_id.');
      return;
    }
    const address = (destinationAddress ?? walletAddress)?.trim();
    if (!address) {
      toast.error('Indica la dirección destino (destination_address) donde desplegar el reference script.');
      return;
    }
    setDeployLoadingPolicyId(policyId);
    try {
      const result = await deployReferenceScript({
        destination_address: address,
        policy_id: policyId,
      });
      if (result.success && result.data) {
        const d = result.data;
        const contractName = d.contract_name || getContractNameFromContract(projectContract) || 'Reference script';
        const walletAddr = (walletAddress || d.destination_address || '').trim();
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletAddr,
          buildTxResponse: d,
          metadata: {},
        });
        setNewTransactionBuild({
          ...mappedTransactionData,
          transaction_id: d.transaction_id,
          title: 'Deploy reference script',
          subtitle: `${contractName} → ${(d.destination_address || '').slice(0, 20)}…`,
          tx_id: d.transaction_id,
          tx_type: 'deploy_reference_script',
          _deployPolicyId: policyId,
        });
        setSignType('sendTransaction');
        setSignTransactionModal(true);
        setDeployModalContract(null);
        setDeployModalDestinationAddress('');
      }
    } finally {
      setDeployLoadingPolicyId(null);
    }
  };

  const openDeployModal = (proj: any) => {
    setDeployModalContract(proj);
    setDeployModalDestinationAddress(walletAddress || '');
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

    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor: 'bg-custom-dark',
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente: 'font-semibold',
    fuenteAlterna: 'font-medium',
    fuenteVariante: 'font-normal',
  };

  // Contratos protocolo: minting con nombre protocol/protocol_nfts; distinguidos por policy_id
  const protocolContractsList = useMemo(() => {
    const fromCompiled = (compiledContracts || []).filter((c: any) => {
      const type = getContractTypeFromContract(c);
      const name = (getContractNameFromContract(c) || '').toLowerCase();
      return type === 'minting' && (name.includes('protocol') || name === 'protocol_nfts');
    });
    const fromResult = protocolCompileResult?.protocol_nfts
      ? [{ ...protocolCompileResult.protocol_nfts, policy_id: protocolCompileResult.protocol_nfts.policy_id }]
      : [];
    const seen = new Set(fromCompiled.map((c: any) => getPolicyIdFromContract(c)).filter(Boolean));
    fromResult.forEach((c: any) => {
      if (c?.policy_id && !seen.has(c.policy_id)) {
        fromCompiled.push(c);
        seen.add(c.policy_id);
      }
    });
    return fromCompiled;
  }, [compiledContracts, protocolCompileResult]);

  // Contratos de proyecto: compilados que no son protocolo (spending o project_nfts por nombre o con compilation_params)
  const projectContractsList = useMemo(() => {
    return (compiledContracts || []).filter((c: any) => {
      const name = (getContractNameFromContract(c) || '').toLowerCase();
      const type = getContractTypeFromContract(c);
      const params = getCompilationParamsFromContract(c);
      if (name === 'protocol' || name === 'protocol_nfts') return false;
      // Contratos de proyecto: spending no protocolo, o con compilation_params (origen protocolo)
      if (type === 'spending' && !name.includes('protocol')) return true;
      if (type === 'minting' && name.endsWith('_nfts')) return true;
      if (params.length > 0 && type === 'spending') return true;
      return false;
    });
  }, [compiledContracts]);

  // Por cada policy_id de protocolo, proyectos cuyo compilation_params lo incluye
  const projectsByProtocolPolicyId = useMemo(() => {
    const map = new Map<string, any[]>();
    (protocolContractsList || []).forEach((c: any) => {
      const pid = getPolicyIdFromContract(c) || c?.policy_id;
      if (pid) map.set(pid, []);
    });
    (projectContractsList || []).forEach((c: any) => {
      const params = getCompilationParamsFromContract(c);
      params.forEach((protocolPid: string) => {
        const list = map.get(protocolPid);
        if (list) list.push(c);
      });
    });
    return map;
  }, [protocolContractsList, projectContractsList]);

  // Datum del protocolo para el modal "Actualizar protocolo" (pre-rellenar protocol_admins, oracle_id, protocol_fee)
  const updateProtocolModalDatum = useMemo(() => {
    if (!updateProtocolModalPolicyId) return undefined;
    const spendingContract = (compiledContracts || []).find((sc: any) => {
      const type = getContractTypeFromContract(sc);
      if (type !== 'spending') return false;
      const params = getCompilationParamsFromContract(sc) || [];
      return params.includes(updateProtocolModalPolicyId);
    });
    const spendingPolicyId = spendingContract
      ? (getPolicyIdFromContract(spendingContract) || spendingContract.policy_id)
      : null;
    if (!spendingPolicyId) return undefined;
    const datumState = datumByPolicyId[spendingPolicyId];
    return datumState?.data?.datum as { oracle_id?: string; protocol_fee?: number; project_admins?: string[] } | undefined;
  }, [updateProtocolModalPolicyId, compiledContracts, datumByPolicyId]);

  // Datum del proyecto para el modal "Actualizar proyecto" (pre-rellenar campos del formulario)
  const updateProjectModalDatum = useMemo((): ProjectDatumForForm | undefined => {
    if (!updateProjectModalContract) return undefined;
    const mintId = getPolicyIdFromContract(updateProjectModalContract) || updateProjectModalContract?.policy_id;
    if (!mintId) return undefined;
    const spendingContract = (projectContractsList || []).find((sc: any) => {
      const type = getContractTypeFromContract(sc);
      if (type !== 'spending') return false;
      const params = getCompilationParamsFromContract(sc) || [];
      return params.includes(mintId);
    });
    const spendingPolicyId = spendingContract
      ? (getPolicyIdFromContract(spendingContract) || spendingContract.policy_id)
      : null;
    if (!spendingPolicyId) return undefined;
    const datumState = datumByPolicyId[spendingPolicyId];
    return datumState?.data?.datum as ProjectDatumForForm | undefined;
  }, [updateProjectModalContract, projectContractsList, datumByPolicyId]);

  // policy_ids de contratos spending de protocolo (para cargar datum al listar), solo cuando el protocolo está minteado
  const protocolSpendingPolicyIds = useMemo(() => {
    const ids: string[] = [];
    (protocolContractsList || []).forEach((c: any) => {
      const mintPolicyId = getPolicyIdFromContract(c) || c?.policy_id;
      if (!mintPolicyId) return;
      const isMintedForProtocol =
        mintedProtocolPolicyIds.has(mintPolicyId) ||
        c?.minted === true ||
        c?.is_minted === true ||
        c?.has_minted_tokens === true;
      if (!isMintedForProtocol) return;
      const spendingContract = (compiledContracts || []).find((sc: any) => {
        const scType = getContractTypeFromContract(sc);
        if (scType !== 'spending') return false;
        const scName = (getContractNameFromContract(sc) || '').toLowerCase();
        if (scName !== 'protocol') return false;
        const params = getCompilationParamsFromContract(sc) || [];
        return params.includes(mintPolicyId);
      });
      const sid = spendingContract
        ? (getPolicyIdFromContract(spendingContract) || (spendingContract as any).policy_id)
        : null;
      if (sid) ids.push(sid);
    });
    return ids;
  }, [protocolContractsList, compiledContracts, mintedProtocolPolicyIds]);

  // Cargar datum de cada contrato spending de protocolo cuando cambia el listado (fallback por si no se disparó desde refreshContracts)
  useEffect(() => {
    const ids = protocolSpendingPolicyIds || [];
    const toFetch: string[] = [];
    setDatumByPolicyId((prev) => {
      const next: Record<string, { data: GetContractDatumResponse | null; loading: boolean; error: string | null }> = {};
      ids.forEach((pid) => {
        const existing = prev[pid];
        const hasResult = existing && (existing.data || existing.error);
        const alreadyLoading = existing?.loading;
        if (hasResult) {
          next[pid] = existing;
        } else if (!alreadyLoading) {
          next[pid] = { data: null, loading: true, error: null };
          toFetch.push(pid);
        } else {
          next[pid] = existing;
        }
      });
      return next;
    });
    const setDatumResult = (
      policyId: string,
      result: { success: boolean; data: GetContractDatumResponse | null; error?: string } | null
    ) => {
      setDatumByPolicyId((prev) => ({
        ...prev,
        [policyId]: {
          data: result?.success && result?.data ? result.data : null,
          loading: false,
          error: result?.success ? null : (result?.error || 'Error al obtener el datum'),
        },
      }));
    };

    toFetch.forEach((policyId) => {
      getContractDatum(policyId)
        .then((result) => setDatumResult(policyId, result))
        .catch((err) => {
          console.error('Error cargando datum para', policyId, err);
          setDatumResult(policyId, {
            success: false,
            data: null,
            error: err?.message || 'Error al obtener el datum',
          });
        });
    });
  }, [protocolSpendingPolicyIds.join(',')]);

  if (!walletData) return null

  const refreshContracts = async (enrich?: boolean) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error('No se encontró el token de acceso. Por favor, desbloquea la billetera.');
      return;
    }

    setIsLoadingContracts(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };

      const contractsUrl = `/api/contracts${enrich ? '?enrich=true' : ''}`;
      const [availableRes, compiledRes] = await Promise.all([
        fetch('/api/contracts/available', { method: 'GET', headers }),
        fetch(contractsUrl, { method: 'GET', headers }),
      ]);

      const [availableData, compiledData] = await Promise.all([
        safeJson(availableRes),
        safeJson(compiledRes),
      ]);

      if (!availableRes.ok || availableData?.success === false) {
        const msg =
          availableData?.error ||
          availableData?.details?.[0]?.message ||
          'Error al obtener contratos disponibles';
        toast.error(msg);
      } else {
        // available viene como: { minting: [...], spending: [...], total }
        const minting = Array.isArray(availableData?.minting) ? availableData.minting : [];
        const spending = Array.isArray(availableData?.spending) ? availableData.spending : [];

        // inyectar contract_type para que compile/delete y el cruce sean consistentes
        const mintingWithType = minting.map((c: any) => ({
          ...c,
          contract_type: 'minting',
        }));
        const spendingWithType = spending.map((c: any) => ({
          ...c,
          contract_type: 'spending',
        }));

        setAvailableContractsByType({
          minting: mintingWithType,
          spending: spendingWithType,
          total: typeof availableData?.total === 'number' ? availableData.total : mintingWithType.length + spendingWithType.length,
        });
      }

      if (!compiledRes.ok || compiledData?.success === false) {
        const msg =
          compiledData?.error ||
          compiledData?.details?.[0]?.message ||
          'Error al obtener contratos compilados';
        toast.error(msg);
      } else {
        const compiledList = normalizeToArray(compiledData);
        setCompiledContracts(compiledList);

        // Obtener policy_ids de contratos spending (protocolo y proyectos) minteados y cargar datum de cada uno
        const spendingIds: string[] = [];
        // Protocolos minteados
        const protocolMintingFromList = compiledList.filter((c: any) => {
          const type = getContractTypeFromContract(c);
          const name = (getContractNameFromContract(c) || '').toLowerCase();
          return type === 'minting' && (name.includes('protocol') || name === 'protocol_nfts');
        });
        protocolMintingFromList.forEach((c: any) => {
          const mintPolicyId = getPolicyIdFromContract(c) || c?.policy_id;
          if (!mintPolicyId) return;
          const isMintedForProtocol =
            mintedProtocolPolicyIds.has(mintPolicyId) ||
            c?.minted === true ||
            c?.is_minted === true ||
            c?.has_minted_tokens === true;
          if (!isMintedForProtocol) return;
          const spendingContract = compiledList.find((sc: any) => {
            const scType = getContractTypeFromContract(sc);
            if (scType !== 'spending') return false;
            const scName = (getContractNameFromContract(sc) || '').toLowerCase();
            if (scName !== 'protocol') return false;
            const params = getCompilationParamsFromContract(sc) || [];
            return params.includes(mintPolicyId);
          });
          const sid = spendingContract
            ? (getPolicyIdFromContract(spendingContract) || (spendingContract as any).policy_id)
            : null;
          if (sid && !spendingIds.includes(sid)) spendingIds.push(sid);
        });
        // Proyectos minteados
        const projectMintingFromList = compiledList.filter((c: any) => {
          const type = getContractTypeFromContract(c);
          const name = (getContractNameFromContract(c) || '').toLowerCase();
          if (type !== 'minting') return false;
          if (name === 'protocol' || name === 'protocol_nfts' || name.includes('protocol')) return false;
          return name.endsWith('_nfts');
        });
        projectMintingFromList.forEach((c: any) => {
          const projMintPolicyId = getPolicyIdFromContract(c) || c?.policy_id;
          if (!projMintPolicyId) return;
          const isProjectMinted =
            mintedProjectPolicyIds.has(projMintPolicyId) ||
            c?.minted === true ||
            c?.is_minted === true ||
            c?.has_minted_tokens === true;
          if (!isProjectMinted) return;
          const projSpendingContract = compiledList.find((sc: any) => {
            const scType = getContractTypeFromContract(sc);
            if (scType !== 'spending') return false;
            const params = getCompilationParamsFromContract(sc) || [];
            return params.includes(projMintPolicyId);
          });
          const psid = projSpendingContract
            ? (getPolicyIdFromContract(projSpendingContract) || (projSpendingContract as any).policy_id)
            : null;
          if (psid && !spendingIds.includes(psid)) spendingIds.push(psid);
        });
        spendingIds.forEach((policyId) => {
          setDatumByPolicyId((prev) => ({
            ...prev,
            [policyId]: { data: null, loading: true, error: null },
          }));
        });
        spendingIds.forEach((policyId) => {
          getContractDatum(policyId)
            .then((result) => {
              setDatumByPolicyId((prev) => ({
                ...prev,
                [policyId]: {
                  data: result?.success && result?.data ? result.data : null,
                  loading: false,
                  error: result?.success ? null : (result?.error || 'Error al obtener el datum'),
                },
              }));
            })
            .catch((err) => {
              console.error('Error cargando datum para', policyId, err);
              setDatumByPolicyId((prev) => ({
                ...prev,
                [policyId]: {
                  data: null,
                  loading: false,
                  error: err?.message || 'Error al obtener el datum',
                },
              }));
            });
        });
      }

      setContractsLastSyncAt(Date.now());
    } catch (err: any) {
      console.error('Error refrescando contratos:', err);
      toast.error(err?.message || 'Error refrescando contratos');
    } finally {
      setIsLoadingContracts(false);
    }
  };

  const findCompiledForAvailable = (available: any) => {
    const availablePolicyId = getPolicyIdFromContract(available);
    const availableName = getContractNameFromContract(available);
    const availableType = getContractTypeFromContract(available);

    if (availablePolicyId) {
      const matchByPolicy = compiledContracts.find((c: any) => {
        const pid = getPolicyIdFromContract(c);
        return pid && pid === availablePolicyId;
      });
      if (matchByPolicy) return matchByPolicy;
    }

    if (availableName && availableType) {
      const matchByNameType = compiledContracts.find((c: any) => {
        const n = getContractNameFromContract(c);
        const t = getContractTypeFromContract(c);
        return n === availableName && t === availableType;
      });
      if (matchByNameType) return matchByNameType;
    }

    // fallback por file_path si el backend lo retorna en compilados
    const availableFilePath = getContractFilePath(available);
    if (availableFilePath) {
      const matchByFilePath = compiledContracts.find((c: any) => {
        const fp = getContractFilePath(c);
        return fp && fp === availableFilePath;
      });
      if (matchByFilePath) return matchByFilePath;
    }

    if (availableName) {
      const matchByNameOnly = compiledContracts.find((c: any) => {
        const n = getContractNameFromContract(c);
        return n === availableName;
      });
      if (matchByNameOnly) return matchByNameOnly;
    }

    return null;
  };

  /** Contratos compilados (endpoint contracts) que coinciden con este tipo de available (mismo name + type) */
  const getCompiledForType = (availableItem: any) => {
    const name = getContractNameFromContract(availableItem);
    const type = getContractTypeFromContract(availableItem);
    if (!name || !type) return [];
    return (compiledContracts || []).filter((c: any) => {
      const n = getContractNameFromContract(c);
      const t = getContractTypeFromContract(c);
      return n === name && t === type;
    });
  };

  const handleCompileContract = async (contract: any) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error('No se encontró el token de acceso. Por favor, desbloquea la billetera.');
      return;
    }

    const contract_name = getContractNameFromContract(contract);
    const contract_type = getContractTypeFromContract(contract);
    if (!contract_name || !contract_type) {
      toast.error('Este contrato no tiene contract_name o contract_type.');
      return;
    }

    const loadingKey = `compile:${contract_name}:${contract_type}`;
    setContractActionLoadingKey(loadingKey);
    try {
      const res = await fetch('/api/contracts/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ contract_name, contract_type }),
      });

      const data = await safeJson(res);
      if (!res.ok || data?.success === false) {
        const msg =
          data?.error ||
          data?.details?.[0]?.message ||
          'Error al compilar el contrato';
        toast.error(msg);
        return;
      }

      toast.success('Contrato compilado correctamente.');
      await refreshContracts(true);
    } catch (err: any) {
      console.error('Error compilando contrato:', err);
      toast.error(err?.message || 'Error compilando contrato');
    } finally {
      setContractActionLoadingKey(null);
    }
  };

  const handleDeleteContract = async (compiledOrAvailable: any) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error('No se encontró el token de acceso. Por favor, desbloquea la billetera.');
      return;
    }

    const policyId = getPolicyIdFromContract(compiledOrAvailable) || getPolicyIdFromContract(findCompiledForAvailable(compiledOrAvailable));
    if (!policyId) {
      toast.error('No se pudo determinar el policy_id del contrato.');
      return;
    }

    const name = (getContractNameFromContract(compiledOrAvailable) || '').toLowerCase();
    const type = getContractTypeFromContract(compiledOrAvailable);
    const params = getCompilationParamsFromContract(compiledOrAvailable) || [];
    const isProtocol = name.includes('protocol') || name === 'protocol_nfts';
    const isProject = !isProtocol && (name.includes('project') || name.endsWith('_nfts'));

    let mintPolicyIdForBurn: string | null = null;
    if (type === 'minting') {
      mintPolicyIdForBurn = policyId;
    } else if (type === 'spending' && params.length > 0) {
      mintPolicyIdForBurn =
        params.find((p: string) =>
          isProtocol ? mintedProtocolPolicyIds.has(p) : mintedProjectPolicyIds.has(p)
        ) || params[0];
    }

    const isMinted =
      (isProtocol &&
        (mintedProtocolPolicyIds.has(mintPolicyIdForBurn || policyId) ||
          compiledOrAvailable?.minted === true ||
          compiledOrAvailable?.is_minted === true ||
          compiledOrAvailable?.has_minted_tokens === true)) ||
      (isProject &&
        (mintedProjectPolicyIds.has(mintPolicyIdForBurn || policyId) ||
          compiledOrAvailable?.minted === true ||
          compiledOrAvailable?.is_minted === true ||
          compiledOrAvailable?.has_minted_tokens === true));

    const ok = typeof window !== 'undefined'
      ? window.confirm(`¿Eliminar el contrato con policy_id ${policyId}?`)
      : true;
    if (!ok) return;

    const loadingKey = `delete:${policyId}`;
    setContractActionLoadingKey(loadingKey);
    try {
      if ((isProtocol || isProject) && isMinted) {
        const burnPolicyId = mintPolicyIdForBurn || policyId;
        if (!burnPolicyId) {
          toast.error('No se pudo determinar el policy_id de minting para burn.');
          return;
        }
        lastMintPolicyIdRef.current = null;
        lastMintProjectPolicyIdRef.current = null;

        const burnResult = isProtocol
          ? await burnProtocol({ protocol_nfts_policy_id: burnPolicyId })
          : await burnProject({ project_nfts_policy_id: burnPolicyId });

        if (!burnResult.success || !burnResult.data) {
          toast.error(burnResult.error || 'No se pudo construir la transacción de burn.');
          return;
        }

        const d: any = burnResult.data;
        const burnTxId = d.transaction_id || d.tx_id || '';
        pendingDeleteAfterSignRef.current = { policyIdToDelete: policyId, burnTxId };
        setNewTransactionBuild({
          transaction_id: d.transaction_id,
          title: isProtocol ? 'Burn protocolo' : 'Burn proyecto',
          subtitle: d.protocol_contract_address || d.project_contract_address || d.transaction_id,
          tx_id: d.transaction_id,
          tx_type: isProtocol ? 'burn_protocol' : 'burn_project',
          tx_fee: ((d.fee_lovelace ?? 0) / 1_000_000).toFixed(6),
          tx_value: '0',
          tx_assets: [],
          block: 0,
          tx_size: 0,
          inputUTxOs: Array.isArray(d.inputs) ? d.inputs : [],
          outputUTxOs: Array.isArray(d.outputs) ? d.outputs : [],
          metadata: {},
          _burnPolicyId: burnPolicyId,
        });
        setSignType('sendTransaction');
        setSignTransactionModal(true);
        return;
      }

      const result = await deleteContract(policyId);
      if (!result.success) {
        toast.error(result.error || 'Error al eliminar el contrato');
        return;
      }
      toast.success('Contrato eliminado correctamente.');
      await refreshContracts(true);
    } catch (err: any) {
      console.error('Error eliminando contrato:', err);
      toast.error(err?.message || 'Error eliminando contrato');
    } finally {
      setContractActionLoadingKey(null);
    }
  };

  const compiledPolicyIdSet = new Set(
    compiledContracts
      .map((c: any) => getPolicyIdFromContract(c))
      .filter(Boolean)
  );

  // Incluir contratos compilados de tipo minting (proyectos, ej. project_nfts) que no vengan en /available
  const displayMinting = useMemo(() => {
    const available = availableContractsByType.minting || [];
    const compiledMinting = (projectContractsList || []).filter((c: any) => getContractTypeFromContract(c) === 'minting');
    const availablePids = new Set(available.map((c: any) => getPolicyIdFromContract(c)).filter(Boolean));
    const extra = compiledMinting.filter((c: any) => {
      const pid = getPolicyIdFromContract(c);
      return pid && !availablePids.has(pid);
    });
    return [...available, ...extra];
  }, [availableContractsByType.minting, projectContractsList]);

  // Incluir contratos compilados de tipo spending (proyectos) que no vengan en /available para que se vean en Contratos disponibles
  const displaySpending = useMemo(() => {
    const available = availableContractsByType.spending || [];
    const compiledSpending = (projectContractsList || []).filter((c: any) => getContractTypeFromContract(c) === 'spending');
    const availablePids = new Set(available.map((c: any) => getPolicyIdFromContract(c)).filter(Boolean));
    const extra = compiledSpending.filter((c: any) => {
      const pid = getPolicyIdFromContract(c);
      return pid && !availablePids.has(pid);
    });
    return [...available, ...extra];
  }, [availableContractsByType.spending, projectContractsList]);

  const allAvailableContracts = [
    ...displayMinting,
    ...displaySpending,
  ];

  const allTags = Array.from(
    new Set(allAvailableContracts.flatMap((c: any) => getContractTags(c)))
  ).sort((a, b) => a.localeCompare(b));

  const filterContracts = (contracts: any[]) => {
    const q = (contractSearch || '').trim().toLowerCase();
    return contracts.filter((c: any) => {
      if (selectedTag && !getContractTags(c).includes(selectedTag)) return false;
      if (!q) return true;

      const haystack = [
        getContractNameFromContract(c),
        getContractTypeFromContract(c),
        getContractCategory(c),
        getContractFilePath(c),
        getContractDescription(c),
        ...getContractTags(c),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  };

  const filteredMinting = filterContracts(displayMinting);
  const filteredSpending = filterContracts(displaySpending);
  return (
    <>
      {/* {sendTokenAcces ?
        <div className="grid grid-cols-2">
          <div
            id="alert-additional-content-3"
            className="col-span-2 p-4 mb-5 space-y-4 text-gray-600 border border-gray-200 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
            role="alert"
          >
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium flex gap-x-2 items-center">
                <InfoIcon /> Aguarda mientras verificamos el token de acceso
              </h3>
            </div>
          </div>
        </div>
        :
        hasTokenAcces ? <div className="grid grid-cols-2">
          <div
            id="alert-additional-content-3"
            className="col-span-2 p-4 mb-5 space-y-4 text-green-600 border border-green-200 rounded-lg bg-green-100 dark:bg-gray-700 dark:text-green-300 dark:border-green-700"
            role="alert"
          >
            <div className="flex flex-col space-y-4">
              <h3 className={`${colors.fuente} text-lg font-medium flex gap-x-2 items-center`}>
                <TrophyIcon /> Tu marketplace está configurado correctamente
              </h3>
            </div>
          </div>
        </div>
          :
          walletData.balance !== "0" ?
            <div
              id="alert-additional-content-3"
              className={`${colors.fuenteAlterna}  col-span-2 p-4 mb-5 space-y-4 text-blue-700 border border-blue-200 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-700`}
              role="alert"
            >
              <div className="flex flex-col space-y-4">
                <div className="space-y-4">
                  <h3 className={`${colors.fuente}   text-lg font-medium flex gap-x-2 items-center`}>
                    <WarningIcon /> Creación del token de acceso
                  </h3>
                  <div className="text-md">
                    Este paso es indispensable para que los usuarios puedan ingresar
                    y operar dentro de la aplicación
                  </div>

                  <button
                    onClick={() => configureMarketplace()} disabled={loadingSendTokenAccess} className={`text-white ${colors.fuente} ${colors.bgColor} ${colors.hoverBgColor} relative py-2 px-6 rounded-md  text-sm hover:bg-blue-400  min-h-10 min-w-40`}>
                    {loadingSendTokenAccess ? (
                      <TailSpin
                        width="20"
                        color="blue"
                        wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      />
                    ) : (
                      'Enviar token de acceso'
                    )}
                  </button>

                </div>
              </div>
            </div>
            :
            <div
              id="alert-additional-content-3"
              className="col-span-2 p-4 mb-5 space-y-4 text-amber-800 border border-amber-300 rounded-lg bg-amber-50 dark:bg-gray-800 dark:text-amber-400 dark:border-amber-800"
              role="alert"
            >
              <div className="flex flex-col space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex gap-x-2 items-center">
                    < InfoIcon /> Envia fondos a tu billetera para finalizar la configuración del marketplace
                  </h3>
                  <div className="text-md">
                    Con esto tendrás fondos para poder generar el token de acceso a tu marketplace
                  </div>
                </div>
              </div>
            </div>
      } */}
      <div className={`${colors.fuente} grid grid-cols-2 gap-y-6`}>
        {/* <div className={`${colors.fuenteAlterna} col-span-2`}>
          <Card>
            <Card.Header title="Billetera Oráculo" />
            <Card.Body>
              <div className="flex flex-col space-y-2">
                <div>
                  <label className="block mb-2 text-gray-900">
                    Consulta de saldo
                  </label>
                  <div className="flex space-x-2 items-center">
                    <button
                      type="button"
                      className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 `}
                      onClick={handleGetOracleWalletLovelaceBalance}
                    >
                      {isLoading.query ? (
                        <LoadingIcon className="w-5 h-5" />
                      ) : (
                        'Consultar'
                      )}
                    </button>
                    <label
                      className={`${
                        !oracleWalletLovelaceBalance && 'hidden'
                      } text-gray-900`}
                    >
                      El saldo de la billetera Oraculo es de{' '}
                      {oracleWalletLovelaceBalance &&
                        oracleWalletLovelaceBalance / 1000000}{' '}
                      ADAs
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block mb-2 text-gray-900">
                      Recarga de ADAs a billetera Oraculo
                    </label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                        t₳
                      </div>
                      <input
                        id="adas"
                        type="text"
                        aria-invalid="false"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
                        autoComplete="off"
                        placeholder="0.000000"
                        value={adaToSend}
                        onChange={(e) => setAdaToSend(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={` ${colors.fuente}  text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 `}
                    onClick={handleSendTransaction}
                  >
                    {isLoading.transfer ? (
                      <LoadingIcon className="w-5 h-5" />
                    ) : (
                      'Transferir'
                    )}
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div> */}

        <div className="col-span-2">
          <Card>
            <Card.Header title="Agregar o remover rol de core wallet" />
            <Card.Body>
              <div className="flex flex-col gap-3 text-sm text-gray-700">
                <p>
                  Usa estos botones para <strong>promover</strong> la billetera activa como
                  core wallet del marketplace o para <strong>revocar</strong> ese rol.
                </p>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-3 flex flex-col gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800">
                      Wallet ID a gestionar (puede ser cualquiera):
                    </span>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="wallet_id..."
                      value={coreWalletIdInput}
                      onChange={(e) => setCoreWalletIdInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <button
                    type="button"
                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-xs px-3 py-1.5 disabled:opacity-50`}
                    onClick={async () => {
                      const targetId = coreWalletIdInput.trim();
                      if (!targetId) {
                        toast.error('Ingresa un wallet_id para promover como core wallet.');
                        return;
                      }
                      await promoteWallet(targetId);
                    }}
                    disabled={!coreWalletIdInput.trim()}
                  >
                    Promover como core wallet
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded text-xs px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
                    onClick={async () => {
                      const targetId = coreWalletIdInput.trim();
                      if (!targetId) {
                        toast.error('Ingresa un wallet_id para quitar el rol de core wallet.');
                        return;
                      }
                      await unpromoteWallet(targetId);
                    }}
                    disabled={!coreWalletIdInput.trim()}
                  >
                    Quitar rol de core wallet
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className={`${colors.fuenteAlterna} col-span-2`}>
          <Card>
            <Card.Header
              title="Protocolo: Compilar y mintear"
              tooltip={
                <button
                  type="button"
                  className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 min-w-28`}
                  onClick={() => { setProtocolCompileResult(null); refreshContracts(true); }}
                  disabled={isLoadingContracts}
                >
                  {isLoadingContracts ? <LoadingIcon className="w-5 h-5" /> : 'Actualizar lista'}
                </button>
              }
            />
            <Card.Body>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-4 py-2 disabled:opacity-50`}
                    onClick={openProtocolCompileModal}
                    disabled={protocolCompileLoading}
                  >
                    {protocolCompileLoading ? <LoadingIcon className="w-5 h-5 inline" /> : 'Compilar protocolo'}
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Solo se listan contratos <strong>protocolo</strong>. Cada uno puede tener contratos de <strong>proyecto</strong> asociados: desplega la columna Proyectos para verlos y usar <strong>Deploy</strong>. Acciones: <strong>Mintear</strong> o <strong>Crear proyecto</strong>.
                </p>

                {protocolContractsList.length === 0 && projectContractsList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 bg-gray-50">
                    No hay contratos. Compila el protocolo o actualiza la lista.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-2 rounded-tl-lg">Nombre</th>
                          <th className="px-4 py-2">Contratos</th>
                          <th className="px-4 py-2">Estado</th>
                          <th className="px-4 py-2">Proyectos</th>
                          <th className="px-4 py-2 rounded-tr-lg">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {protocolContractsList.map((c: any) => {
                            const mintPolicyId = getPolicyIdFromContract(c) || c?.policy_id || '—';
                            const deleteKey = mintPolicyId ? `delete:${mintPolicyId}` : '';
                            const name = getContractNameFromContract(c) || c?.contract_name || 'protocol_nfts';
                            const isMinted = mintedProtocolPolicyIds.has(mintPolicyId) || c?.minted === true || c?.is_minted === true || c?.has_minted_tokens === true;
                            const isSelected = selectedProtocolPolicyId === mintPolicyId;
                            const projectsOfProtocol = projectsByProtocolPolicyId.get(mintPolicyId) || [];
                            const isExpanded = expandedProtocolPolicyId === mintPolicyId;

                            const spendingContract = (compiledContracts || []).find((sc: any) => {
                              const scType = getContractTypeFromContract(sc);
                              if (scType !== 'spending') return false;
                              const scName = (getContractNameFromContract(sc) || '').toLowerCase();
                              if (scName !== 'protocol') return false;
                              const params = getCompilationParamsFromContract(sc) || [];
                              return params.includes(mintPolicyId);
                            });
                            const spendingPolicyId = spendingContract ? (getPolicyIdFromContract(spendingContract) || spendingContract.policy_id) : null;
                            const spendingTestnetAddress = getTestnetAddressFromContract(spendingContract);
                            return (
                              <React.Fragment key={mintPolicyId}>
                                <tr
                                  className={`bg-white hover:bg-gray-50 ${isSelected ? 'ring-1 ring-inset ring-blue-200 bg-blue-50/30' : ''}`}
                                >
                                  <td className="px-4 py-2 font-medium text-gray-900">Protocolo</td>
                                  <td className="px-4 py-2 align-top">
                                    <div className="flex flex-col gap-1.5 min-w-0 text-xs">
                                      <div className="flex items-center gap-2 py-0.5 border-b border-gray-100">
                                        <span className="shrink-0 w-16 font-medium text-gray-500">Minting</span>
                                        <code className="min-w-0 flex-1 truncate bg-gray-50 px-1.5 py-0.5 rounded font-mono" title={mintPolicyId}>
                                          {mintPolicyId}
                                        </code>
                                        <CopyToClipboard copyValue={mintPolicyId} tooltipLabel="Copiar" iconClassName="h-3.5 w-3.5 shrink-0" />
                                      </div>
                                      <div className="flex items-center gap-2 py-0.5 border-b border-gray-100">
                                        <span className="shrink-0 w-16 font-medium text-gray-500">Spending</span>
                                        {spendingPolicyId ? (
                                          <>
                                            <code className="min-w-0 flex-1 truncate bg-gray-50 px-1.5 py-0.5 rounded font-mono" title={spendingPolicyId}>
                                              {spendingPolicyId}
                                            </code>
                                            <CopyToClipboard copyValue={spendingPolicyId} tooltipLabel="Copiar" iconClassName="h-3.5 w-3.5 shrink-0" />
                                          </>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </div>
                                      {spendingTestnetAddress && (
                                        <div className="flex items-center gap-2 py-0.5">
                                          <span className="shrink-0 w-16 font-medium text-gray-500">Address</span>
                                          <code className="min-w-0 flex-1 truncate bg-gray-50 px-1.5 py-0.5 rounded font-mono text-[11px]" title={spendingTestnetAddress}>
                                            {spendingTestnetAddress}
                                          </code>
                                          <CopyToClipboard copyValue={spendingTestnetAddress} tooltipLabel="Copiar" iconClassName="h-3.5 w-3.5 shrink-0" />
                                        </div>
                                      )}
                                      {spendingPolicyId && (() => {
                                        const datumState = datumByPolicyId[spendingPolicyId];
                                        if (!datumState) return null;
                                        if (datumState.loading) {
                                          return (
                                            <div className="flex items-center gap-2 py-1 border-t border-gray-100 mt-1">
                                              <LoadingIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                              <span className="text-[11px] text-gray-500">Cargando datum…</span>
                                            </div>
                                          );
                                        }
                                        if (datumState.error) {
                                          return (
                                            <div className="py-1 border-t border-gray-100 mt-1">
                                              <span className="text-[11px] text-red-600">Datum: {datumState.error}</span>
                                            </div>
                                          );
                                        }
                                        const d = datumState.data;
                                        if (!d) return null;
                                        return (
                                          <div className="py-1 border-t border-gray-100 mt-1 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-[11px] font-medium text-gray-500">Datum</span>
                                              {d.balance_ada != null && (
                                                <span className="text-[11px] text-gray-700">{d.balance_ada} ADA</span>
                                              )}
                                              {d.utxo_ref && (
                                                <code className="text-[10px] bg-gray-50 px-1 rounded truncate max-w-[8rem]" title={d.utxo_ref}>
                                                  {d.utxo_ref}
                                                </code>
                                              )}
                                            </div>
                                            <details className="group/details">
                                              <summary className="text-[11px] text-gray-500 cursor-pointer hover:text-gray-700 list-none inline-flex items-center gap-1">
                                                <span className="group-open/details:rotate-90 transition-transform inline-block">▶</span>
                                                Ver datum completo
                                              </summary>
                                              <pre className="mt-1 bg-gray-50 border border-gray-100 rounded p-1.5 text-[10px] font-mono text-gray-700 overflow-x-auto max-h-32 overflow-y-auto">
                                                {JSON.stringify(d.datum ?? {}, null, 2)}
                                              </pre>
                                            </details>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isMinted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                      {isMinted ? 'Minteado' : 'Sin mintear'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    {projectsOfProtocol.length === 0 ? (
                                      <span className="text-gray-400 text-xs">—</span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedProtocolPolicyId((prev) =>
                                            prev === mintPolicyId ? null : mintPolicyId
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        aria-expanded={isExpanded}
                                      >
                                        <span>Proyectos ({projectsOfProtocol.length})</span>
                                        <svg
                                          className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {isMinted ? (
                                        <button
                                          type="button"
                                          className="font-medium rounded text-xs px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                          onClick={() => setProtocolPolicyIdForNewProject(mintPolicyId)}
                                        >
                                          Crear proyecto
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded text-xs px-3 py-1.5`}
                                          onClick={() => setSelectedProtocolPolicyId(mintPolicyId)}
                                        >
                                          Mintear
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded text-xs px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setUpdateProtocolModalPolicyId(mintPolicyId)}
                                        disabled={!mintPolicyId || !isMinted}
                                      >
                                        Actualizar protocolo
                                      </button>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded text-xs px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleDeleteContract(c)}
                                        disabled={!mintPolicyId || contractActionLoadingKey === deleteKey}
                                      >
                                        {contractActionLoadingKey === deleteKey ? 'Eliminando...' : 'Eliminar'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && projectsOfProtocol.length > 0 && (
                                  <tr className="bg-gray-50/80">
                                    <td colSpan={5} className="px-4 py-3 border-t border-gray-200">
                                      <div className="pl-4 border-l-2 border-gray-200">
                                        <p className="text-xs font-medium text-gray-600 mb-2">Proyectos vinculados a este protocolo</p>
                                        <ul className="space-y-3">
                                          {projectsOfProtocol.map((proj: any) => {
                                            const projMintPolicyId = getPolicyIdFromContract(proj) || proj?.policy_id || '—';
                                            const projName = getContractNameFromContract(proj) || proj?.name || '—';
                                            const isDeploying = deployLoadingPolicyId === projMintPolicyId;
                                            const projDeleteKey = projMintPolicyId ? `delete:${projMintPolicyId}` : '';
                                            const isProjectMinted =
                                              mintedProjectPolicyIds.has(projMintPolicyId) ||
                                              proj?.minted === true ||
                                              proj?.is_minted === true ||
                                              proj?.has_minted_tokens === true;

                                            const projSpendingContract = (projectContractsList || []).find((sc: any) => {
                                              const scType = getContractTypeFromContract(sc);
                                              if (scType !== 'spending') return false;
                                              const params = getCompilationParamsFromContract(sc) || [];
                                              return params.includes(projMintPolicyId);
                                            });
                                            const projSpendingPolicyId = projSpendingContract
                                              ? (getPolicyIdFromContract(projSpendingContract) || projSpendingContract.policy_id)
                                              : null;
                                            const projTestnetAddress = getTestnetAddressFromContract(projSpendingContract);

                                            return (
                                              <li
                                                key={projMintPolicyId || projName}
                                                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-sm"
                                              >
                                                <div className="flex items-center gap-2 flex-wrap justify-between">
                                                  <span className="font-medium text-gray-900 truncate max-w-[12rem]">
                                                    {projName}
                                                  </span>
                                                  <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                      isProjectMinted
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                  >
                                                    {isProjectMinted ? 'Minteado' : 'Sin mintear'}
                                                  </span>
                                                </div>
                                                <div className="flex flex-col gap-1 min-w-0 text-[11px]">
                                                  <div className="flex items-center gap-2 py-0.5 border-b border-gray-100">
                                                    <span className="shrink-0 w-14 font-medium text-gray-500">Minting</span>
                                                    <code className="min-w-0 flex-1 truncate bg-gray-50 px-1.5 py-0.5 rounded font-mono" title={projMintPolicyId || ''}>
                                                      {String(projMintPolicyId || '').slice(0, 24)}…
                                                    </code>
                                                    <CopyToClipboard copyValue={projMintPolicyId || ''} tooltipLabel="Copiar" iconClassName="h-3.5 w-3.5 shrink-0" />
                                                  </div>
                                                  <div className="flex items-center gap-2 py-0.5 border-b border-gray-100">
                                                    <span className="shrink-0 w-14 font-medium text-gray-500">Spending</span>
                                                    {projSpendingPolicyId ? (
                                                      <>
                                                        <code className="min-w-0 flex-1 truncate bg-gray-50 px-1.5 py-0.5 rounded font-mono" title={projSpendingPolicyId}>
                                                          {String(projSpendingPolicyId).slice(0, 24)}…
                                                        </code>
                                                        <CopyToClipboard copyValue={projSpendingPolicyId} tooltipLabel="Copiar" iconClassName="h-3.5 w-3.5 shrink-0" />
                                                      </>
                                                    ) : (
                                                      <span className="text-gray-400">—</span>
                                                    )}
                                                  </div>
                                                  {projTestnetAddress && (
                                                    <div className="flex items-center gap-2 py-0.5">
                                                      <span className="shrink-0 w-14 font-medium text-gray-500">Address</span>
                                                      <code className="min-w-0 flex-1 truncate bg-gray-50 px-1.5 py-0.5 rounded font-mono" title={projTestnetAddress}>
                                                        {projTestnetAddress}
                                                      </code>
                                                      <CopyToClipboard copyValue={projTestnetAddress} tooltipLabel="Copiar" iconClassName="h-3.5 w-3.5 shrink-0" />
                                                    </div>
                                                  )}
                                                  {projSpendingPolicyId && isProjectMinted && (() => {
                                                    const projDatumState = datumByPolicyId[projSpendingPolicyId];
                                                    if (!projDatumState) return null;
                                                    if (projDatumState.loading) {
                                                      return (
                                                        <div className="flex items-center gap-2 py-1 border-t border-gray-100 mt-1">
                                                          <LoadingIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                          <span className="text-[11px] text-gray-500">Cargando datum…</span>
                                                        </div>
                                                      );
                                                    }
                                                    if (projDatumState.error) {
                                                      return (
                                                        <div className="py-1 border-t border-gray-100 mt-1">
                                                          <span className="text-[11px] text-red-600">Datum: {projDatumState.error}</span>
                                                        </div>
                                                      );
                                                    }
                                                    const d = projDatumState.data;
                                                    if (!d) return null;
                                                    return (
                                                      <div className="py-1 border-t border-gray-100 mt-1 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          <span className="text-[11px] font-medium text-gray-500">Datum</span>
                                                          {d.balance_ada != null && (
                                                            <span className="text-[11px] text-gray-700">{d.balance_ada} ADA</span>
                                                          )}
                                                          {d.utxo_ref && (
                                                            <code className="text-[10px] bg-gray-50 px-1 rounded truncate max-w-[8rem]" title={d.utxo_ref}>
                                                              {d.utxo_ref}
                                                            </code>
                                                          )}
                                                        </div>
                                                        <details className="group/details">
                                                          <summary className="text-[11px] text-gray-500 cursor-pointer hover:text-gray-700 list-none inline-flex items-center gap-1">
                                                            <span className="group-open/details:rotate-90 transition-transform inline-block">▶</span>
                                                            Ver datum completo
                                                          </summary>
                                                          <pre className="mt-1 bg-gray-50 border border-gray-100 rounded p-1.5 text-[10px] font-mono text-gray-700 overflow-x-auto max-h-32 overflow-y-auto">
                                                            {JSON.stringify(d.datum ?? {}, null, 2)}
                                                          </pre>
                                                        </details>
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                                <div className="flex flex-wrap justify-end gap-2 mt-1">
                                                  <button
                                                    type="button"
                                                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded text-xs px-2.5 py-1 disabled:opacity-50 flex items-center gap-1`}
                                                    onClick={() => setMintProjectModalContract(proj)}
                                                    disabled={!projMintPolicyId || mintProjectLoadingPolicyId === projMintPolicyId}
                                                    title="Mintear tokens del proyecto"
                                                  >
                                                    {mintProjectLoadingPolicyId === projMintPolicyId ? (
                                                      <LoadingIcon className="w-3.5 h-3.5" />
                                                    ) : null}
                                                    {mintProjectLoadingPolicyId === projMintPolicyId
                                                      ? 'Minteando...'
                                                      : 'Mintear tokens'}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded text-xs px-2.5 py-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => setUpdateProjectModalContract(proj)}
                                                    disabled={!projMintPolicyId || !isProjectMinted}
                                                  >
                                                    Actualizar proyecto
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded text-xs px-2.5 py-1 disabled:opacity-50 flex items-center gap-1`}
                                                    onClick={() => openDeployModal(proj)}
                                                    disabled={isDeploying || !isProjectMinted}
                                                    title="Abrir modal para indicar dirección destino y construir tx"
                                                  >
                                                    {isDeploying ? <LoadingIcon className="w-3.5 h-3.5" /> : null}
                                                    Crear Referencia
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded text-xs px-2.5 py-1 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleDeleteContract(proj)}
                                                    disabled={!projMintPolicyId || contractActionLoadingKey === projDeleteKey}
                                                  >
                                                    {contractActionLoadingKey === projDeleteKey ? 'Eliminando...' : 'Eliminar'}
                                                  </button>
                                                </div>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* <div className="col-span-2">
          <Projects />
        </div> */}

        {/* <div className="col-span-2">
          <Card>
            <Card.Header
              title="Contratos disponibles"
              tooltip={
                <button
                  type="button"
                  className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 min-w-28`}
                  onClick={() => refreshContracts()}
                  disabled={isLoadingContracts}
                >
                  {isLoadingContracts ? <LoadingIcon className="w-5 h-5" /> : 'Actualizar'}
                </button>
              }
            />
            <Card.Body>
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-600">
                        {contractsLastSyncAt
                          ? `Última actualización: ${new Date(contractsLastSyncAt).toLocaleString()}`
                          : 'Aún no has actualizado el listado.'}
                      </div>
                      <div className="text-sm text-gray-800 font-medium">
                        Total disponibles:{' '}
                        {availableContractsByType.total ?? (allAvailableContracts.length || 0)}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="relative">
                        <input
                          className="w-full sm:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
                          placeholder="Buscar por nombre, tag, categoría..."
                          value={contractSearch}
                          onChange={(e) => setContractSearch(e.target.value)}
                        />
                      </div>

                      <select
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                      >
                        <option value="">Todas las etiquetas</option>
                        {allTags.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
                        disabled={!selectedTag && !contractSearch}
                        onClick={() => {
                          setSelectedTag('');
                          setContractSearch('');
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>

                  {allTags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {allTags.slice(0, 12).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`px-2 py-1 rounded-full text-xs border transition ${selectedTag === t
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                        >
                          {t}
                        </button>
                      ))}
                      {allTags.length > 12 ? (
                        <span className="text-xs text-gray-500 self-center">
                          +{allTags.length - 12} más
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {allAvailableContracts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-700 bg-white">
                    <div className="text-lg font-semibold">No hay contratos para mostrar</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Presiona <b>Actualizar</b> para cargar los contratos disponibles (tipos desde <b>available</b>).
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-base font-semibold text-gray-900">Minting</div>
                        <div className="text-sm text-gray-600">{filteredMinting.length} tipo(s)</div>
                      </div>
                      {filteredMinting.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-700 bg-white">
                          No hay tipos <b>minting</b> que coincidan con los filtros.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {filteredMinting.map((availableItem: any, idx: number) => {
                            const name = getContractNameFromContract(availableItem);
                            const type = getContractTypeFromContract(availableItem);
                            const description = getContractDescription(availableItem);
                            const filePath = getContractFilePath(availableItem);
                            const compiledList = getCompiledForType(availableItem);
                            const compileKey = name && type ? `compile:${name}:${type}:${idx}` : `compile:${idx}`;
                            return (
                              <div key={`mint-${name}-${type}-${idx}`} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-lg font-semibold text-gray-900">{name || 'Contrato'}</div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Minting</span>
                                      {filePath ? (
                                        <code className="text-xs bg-gray-50 border rounded px-2 py-0.5 truncate max-w-[200px]" title={filePath}>{filePath}</code>
                                      ) : null}
                                    </div>
                                    {description ? <p className="text-sm text-gray-600 mt-1">{description}</p> : null}
                                  </div>
                                  <button
                                    type="button"
                                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
                                    onClick={() => handleCompileContract(availableItem)}
                                    disabled={!name || !type || contractActionLoadingKey === compileKey}
                                  >
                                    {contractActionLoadingKey === compileKey ? <LoadingIcon className="w-5 h-5 inline" /> : 'Compilar'}
                                  </button>
                                </div>
                                <div className="mt-4">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Contratos generados ({compiledList.length})</div>
                                  {compiledList.length === 0 ? (
                                    <p className="text-sm text-gray-500">Aún no hay instancias compiladas. Usa <b>Compilar</b> para generar una.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                      <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 text-gray-700">
                                          <tr>
                                            <th className="px-4 py-2 text-left rounded-tl-lg">Contratos</th>
                                            <th className="px-4 py-2 text-left rounded-tr-lg">Acción</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {compiledList.map((compiled: any) => {
                                            const pid = getPolicyIdFromContract(compiled);
                                            const mintPolicyId = pid || '—';
                                            const deleteKey = pid ? `delete:${pid}` : '';

                                            const spendingContract = (projectContractsList || []).find((sc: any) => {
                                              const scType = getContractTypeFromContract(sc);
                                              if (scType !== 'spending') return false;
                                              const params = getCompilationParamsFromContract(sc) || [];
                                              return params.includes(mintPolicyId);
                                            });
                                            const spendingPolicyId = spendingContract
                                              ? (getPolicyIdFromContract(spendingContract) || spendingContract.policy_id)
                                              : null;
                                            return (
                                              <tr key={pid || `row-${idx}`} className="bg-white hover:bg-gray-50">
                                                <td className="px-4 py-2">
                                                  <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-xs font-semibold text-gray-700">Minting</span>
                                                      <code className="text-xs bg-gray-100 border rounded px-2 py-1 truncate max-w-[12rem]" title={mintPolicyId}>
                                                        {mintPolicyId}
                                                      </code>
                                                      {pid ? (
                                                        <CopyToClipboard
                                                          iconClassName="h-4 w-4 shrink-0"
                                                          copyValue={mintPolicyId}
                                                          tooltipLabel="Copiar policy_id minting"
                                                        />
                                                      ) : null}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-xs font-semibold text-gray-700">Spending</span>
                                                      {spendingPolicyId ? (
                                                        <>
                                                          <code className="text-xs bg-gray-100 border rounded px-2 py-1 truncate max-w-[12rem]" title={spendingPolicyId}>
                                                            {spendingPolicyId}
                                                          </code>
                                                          <CopyToClipboard
                                                            iconClassName="h-4 w-4 shrink-0"
                                                            copyValue={spendingPolicyId}
                                                            tooltipLabel="Copiar policy_id spending"
                                                          />
                                                        </>
                                                      ) : (
                                                        <span className="text-xs text-gray-400">No encontrado</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                  <button
                                                    type="button"
                                                    className={`${colors.fuente} text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 font-medium rounded text-xs px-3 py-1.5 disabled:opacity-50`}
                                                    onClick={() => handleDeleteContract(compiled)}
                                                    disabled={!pid || contractActionLoadingKey === deleteKey}
                                                  >
                                                    {contractActionLoadingKey === deleteKey ? 'Eliminando...' : 'Eliminar'}
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-base font-semibold text-gray-900">Spending</div>
                        <div className="text-sm text-gray-600">{filteredSpending.length} tipo(s)</div>
                      </div>
                      {filteredSpending.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-700 bg-white">
                          No hay tipos <b>spending</b> que coincidan con los filtros.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {filteredSpending.map((availableItem: any, idx: number) => {
                            const name = getContractNameFromContract(availableItem);
                            const type = getContractTypeFromContract(availableItem);
                            const description = getContractDescription(availableItem);
                            const filePath = getContractFilePath(availableItem);
                            const compiledList = getCompiledForType(availableItem);
                            const compileKey = name && type ? `compile:${name}:${type}:${idx}` : `compile:${idx}`;
                            return (
                              <div key={`spend-${name}-${type}-${idx}`} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-lg font-semibold text-gray-900">{name || 'Contrato'}</div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">Spending</span>
                                      {filePath ? (
                                        <code className="text-xs bg-gray-50 border rounded px-2 py-0.5 truncate max-w-[200px]" title={filePath}>{filePath}</code>
                                      ) : null}
                                    </div>
                                    {description ? <p className="text-sm text-gray-600 mt-1">{description}</p> : null}
                                  </div>
                                  <button
                                    type="button"
                                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
                                    onClick={() => handleCompileContract(availableItem)}
                                    disabled={!name || !type || contractActionLoadingKey === compileKey}
                                  >
                                    {contractActionLoadingKey === compileKey ? <LoadingIcon className="w-5 h-5 inline" /> : 'Compilar'}
                                  </button>
                                </div>
                                <div className="mt-4">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Contratos generados ({compiledList.length})</div>
                                  {compiledList.length === 0 ? (
                                    <p className="text-sm text-gray-500">Aún no hay instancias compiladas. Usa <b>Compilar</b> para generar una.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                      <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 text-gray-700">
                                          <tr>
                                            <th className="px-4 py-2 text-left rounded-tl-lg">policy_id</th>
                                            <th className="px-4 py-2 text-left rounded-tr-lg">Acción</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {compiledList.map((compiled: any) => {
                                            const pid = getPolicyIdFromContract(compiled);
                                            const deleteKey = pid ? `delete:${pid}` : '';
                                            return (
                                              <tr key={pid || `row-${idx}`} className="bg-white hover:bg-gray-50">
                                                <td className="px-4 py-2">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <code className="text-xs bg-gray-100 border rounded px-2 py-1 truncate max-w-[14rem]" title={pid ?? ''}>{pid || '—'}</code>
                                                    {pid ? <CopyToClipboard iconClassName="h-4 w-4 shrink-0" copyValue={pid} tooltipLabel="Copiar policy_id" /> : null}
                                                  </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                  <button
                                                    type="button"
                                                    className={`${colors.fuente} text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 font-medium rounded text-xs px-3 py-1.5 disabled:opacity-50`}
                                                    onClick={() => handleDeleteContract(compiled)}
                                                    disabled={!pid || contractActionLoadingKey === deleteKey}
                                                  >
                                                    {contractActionLoadingKey === deleteKey ? 'Eliminando...' : 'Eliminar'}
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div> */}

        {/* <div className="col-span-2">
          <Scripts />
        </div> */}
      </div>

      {/* Modales renderizados en document.body para centrado correcto. Wrapper con key estable evita re-mount y pérdida de foco al escribir. */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div key="core-wallet-modals" data-portal-root>
            <Modal
              key="select-protocol-utxo-modal"
              show={protocolUtxoModalOpen}
              onClose={() => {
                if (protocolCompileLoading) return;
                setProtocolUtxoModalOpen(false);
                setProtocolUtxos([]);
                setSelectedProtocolUtxoRef(null);
                setProtocolUtxosError(null);
              }}
              size="2xl"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Seleccionar UTXO para compilar protocolo
              </Modal.Header>
              <Modal.Body className="space-y-4 pt-4">
                <p className="text-sm text-gray-600">
                  Elige el UTXO de tu billetera que se utilizará para pagar las fees de la compilación del protocolo.
                </p>

                {protocolUtxosLoading && (
                  <div className="flex items-center justify-center py-4">
                    <LoadingIcon className="w-6 h-6" />
                  </div>
                )}

                {!protocolUtxosLoading && protocolUtxosError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {protocolUtxosError}
                  </div>
                )}

                {!protocolUtxosLoading && !protocolUtxosError && protocolUtxos.length === 0 && (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    No se encontraron UTXOs disponibles para esta billetera.
                  </div>
                )}

                {!protocolUtxosLoading && !protocolUtxosError && protocolUtxos.length > 0 && (
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                    {protocolUtxos.map((u) => {
                      const isSelected = selectedProtocolUtxoRef === u.utxoRef;
                      return (
                        <button
                          key={u.utxoRef}
                          type="button"
                          onClick={() => setSelectedProtocolUtxoRef(u.utxoRef)}
                          className={`w-full text-left border rounded-lg px-3 py-3 text-xs transition bg-white hover:bg-gray-50 ${
                            isSelected ? 'ring-2 ring-blue-500 border-blue-400' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                className="text-blue-600 focus:ring-blue-500 mt-0.5"
                                checked={isSelected}
                                onChange={() => setSelectedProtocolUtxoRef(u.utxoRef)}
                              />
                              <div>
                                <div className="text-[11px] text-gray-500">Tx hash</div>
                                <div className="font-mono text-[11px] text-gray-900 break-all max-w-xs">
                                  {u.txHash || '—'}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="text-[11px] text-gray-500">Índice</div>
                              <div className="text-[11px] text-gray-900 font-medium">{u.index}</div>
                              <div className="text-[11px] text-gray-500 mt-2">ADA</div>
                              <div className="text-[11px] text-emerald-700 font-semibold">
                                {u.ada != null ? u.ada.toFixed(6) : '—'}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 border-t border-dashed border-gray-200 pt-2">
                            <details className="text-xs text-gray-700 group">
                              <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="text-[11px] text-gray-500">Ver dirección y tokens</span>
                                <span className="text-[13px] text-gray-500 transition-transform group-open:rotate-180">
                                  ▾
                                </span>
                              </summary>

                              <div className="mt-2 flex flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[11px] text-gray-500">Dirección completa</span>
                                  <span className="font-mono text-[11px] text-gray-800 break-all">
                                    {u.address || '—'}
                                  </span>
                                </div>

                                <div className="border-t border-dashed border-gray-200 pt-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] text-gray-500">Tokens</span>
                                    {u.tokens && u.tokens.length > 0 ? (
                                      <span className="text-[11px] text-gray-700">
                                        {u.tokens.length} token{u.tokens.length > 1 ? 's' : ''}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-gray-400">Sin tokens nativos</span>
                                    )}
                                  </div>

                                  {u.tokens && u.tokens.length > 0 && (
                                    <div className="mt-1 space-y-1 max-h-28 overflow-y-auto pr-0.5">
                                      {u.tokens.map((t) => (
                                        <div key={t.id} className="flex flex-col">
                                          <div className="flex items-center justify-between gap-2">
                                            <span
                                              className="text-[11px] text-gray-800 font-medium truncate max-w-[10rem]"
                                              title={t.assetName}
                                            >
                                              {t.assetName}
                                            </span>
                                            <span className="text-[11px] text-gray-600 shrink-0">
                                              x {t.quantity}
                                            </span>
                                          </div>
                                          <code
                                            className="bg-gray-100 rounded px-1 py-0.5 text-[10px] text-gray-600 truncate max-w-[11rem]"
                                            title={t.policyId}
                                          >
                                            {t.policyId.slice(0, 24)}…
                                          </code>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </details>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  onClick={() => {
                    if (protocolCompileLoading) return;
                    setProtocolUtxoModalOpen(false);
                    setProtocolUtxos([]);
                    setSelectedProtocolUtxoRef(null);
                    setProtocolUtxosError(null);
                  }}
                  disabled={protocolCompileLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
                  onClick={async () => {
                    if (!selectedProtocolUtxoRef) {
                      toast.error('Selecciona un UTXO para compilar el protocolo.');
                      return;
                    }
                    const ok = await handleCompileProtocol(selectedProtocolUtxoRef);
                    if (ok) {
                      setProtocolUtxoModalOpen(false);
                      setProtocolUtxos([]);
                      setSelectedProtocolUtxoRef(null);
                      setProtocolUtxosError(null);
                    }
                  }}
                  disabled={
                    protocolCompileLoading ||
                    !selectedProtocolUtxoRef ||
                    protocolUtxos.length === 0
                  }
                >
                  {protocolCompileLoading ? (
                    <LoadingIcon className="w-5 h-5 inline" />
                  ) : (
                    'Compilar protocolo'
                  )}
                </button>
              </Modal.Footer>
            </Modal>

            <Modal
              key="mint-protocol-modal"
              show={!!selectedProtocolPolicyId}
              onClose={() => {
                setSelectedProtocolPolicyId(null);
                setProtocolCompileResult(null);
              }}
              size="lg"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Mintear protocolo
                {selectedProtocolPolicyId && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    policy_id:{' '}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {String(selectedProtocolPolicyId).slice(0, 20)}…
                    </code>
                  </span>
                )}
              </Modal.Header>
              <MintProtocolFormContent
                policyIdLabel={String(selectedProtocolPolicyId || '').slice(0, 20)}
                onClose={() => {
                  setSelectedProtocolPolicyId(null);
                  setProtocolCompileResult(null);
                }}
                onSubmit={(formData) => handleMintProtocol(undefined, formData)}
                loading={protocolMintLoading}
                colors={colors}
              />
            </Modal>

            <Modal
              key="mint-project-modal"
              show={!!mintProjectModalContract}
              onClose={() => setMintProjectModalContract(null)}
              size="lg"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Mintear tokens de proyecto
                {mintProjectModalContract && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    policy_id:{' '}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {String(
                        getPolicyIdFromContract(mintProjectModalContract) ||
                          mintProjectModalContract?.policy_id ||
                          ''
                      ).slice(0, 20)}
                      …
                    </code>
                  </span>
                )}
              </Modal.Header>
              {mintProjectModalContract && (
                <MintProjectFormContent
                  projectNameLabel={
                    getContractNameFromContract(mintProjectModalContract) ||
                    mintProjectModalContract?.name ||
                    ''
                  }
                  policyIdLabel={String(
                    getPolicyIdFromContract(mintProjectModalContract) ||
                      mintProjectModalContract?.policy_id ||
                      ''
                  ).slice(0, 20)}
                  onClose={() => setMintProjectModalContract(null)}
                  onSubmit={(formData) =>
                    handleMintProject(mintProjectModalContract, formData)
                  }
                  loading={
                    !!mintProjectModalContract &&
                    mintProjectLoadingPolicyId ===
                      (getPolicyIdFromContract(mintProjectModalContract) ||
                        mintProjectModalContract?.policy_id)
                  }
                  colors={colors}
                />
              )}
            </Modal>

            <Modal
              key="update-protocol-modal"
              show={!!updateProtocolModalPolicyId}
              onClose={() => setUpdateProtocolModalPolicyId(null)}
              size="lg"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Actualizar protocolo
                {updateProtocolModalPolicyId && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    policy_id:{' '}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {String(updateProtocolModalPolicyId).slice(0, 20)}…
                    </code>
                  </span>
                )}
              </Modal.Header>
              {updateProtocolModalPolicyId && (
                <UpdateProtocolFormContent
                  policyIdLabel={updateProtocolModalPolicyId.slice(0, 20)}
                  onClose={() => setUpdateProtocolModalPolicyId(null)}
                  onSubmit={(formData) => handleUpdateProtocol(updateProtocolModalPolicyId, formData)}
                  loading={updateProtocolLoading}
                  colors={colors}
                  initialDatum={updateProtocolModalDatum}
                />
              )}
            </Modal>

            <Modal
              key="datum-modal"
              show={!!datumModalSpendingPolicyId}
              onClose={() => {
                setDatumModalSpendingPolicyId(null);
                setDatumData(null);
                setDatumError(null);
              }}
              size="lg"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Datum del contrato spending (protocolo)
                {datumModalSpendingPolicyId && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    policy_id:{' '}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {String(datumModalSpendingPolicyId).slice(0, 24)}…
                    </code>
                  </span>
                )}
              </Modal.Header>
              <Modal.Body className="pt-4">
                {datumLoading && (
                  <div className="flex items-center justify-center py-8">
                    <LoadingIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {!datumLoading && datumError && (
                  <p className="text-sm text-red-600 py-2">{datumError}</p>
                )}
                {!datumLoading && datumData && (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 font-medium">contract_name</span>
                        <p className="font-mono text-gray-800">{datumData.contract_name ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">contract_type</span>
                        <p className="font-mono text-gray-800">{datumData.contract_type ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">utxo_ref</span>
                        <p className="font-mono text-gray-800 text-xs break-all">{datumData.utxo_ref ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">balance</span>
                        <p className="font-mono text-gray-800">
                          {datumData.balance_ada != null ? `${datumData.balance_ada} ADA` : '—'}
                          {datumData.balance_lovelace != null && (
                            <span className="text-gray-500 ml-1">({datumData.balance_lovelace} lovelace)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium block mb-1">datum</span>
                      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-800 overflow-x-auto max-h-64 overflow-y-auto">
                        {JSON.stringify(datumData.datum ?? {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </Modal.Body>
            </Modal>

            <Modal
              key="update-project-modal"
              show={!!updateProjectModalContract}
              onClose={() => setUpdateProjectModalContract(null)}
              size="lg"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Actualizar proyecto
                {updateProjectModalContract && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    policy_id:{' '}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {String(
                        getPolicyIdFromContract(updateProjectModalContract) ||
                          updateProjectModalContract?.policy_id ||
                          ''
                      ).slice(0, 20)}
                      …
                    </code>
                  </span>
                )}
              </Modal.Header>
              {updateProjectModalContract && (
                <UpdateProjectFormContent
                  projectNameLabel={
                    getContractNameFromContract(updateProjectModalContract) ||
                    updateProjectModalContract?.name ||
                    ''
                  }
                  policyIdLabel={String(
                    getPolicyIdFromContract(updateProjectModalContract) ||
                      updateProjectModalContract?.policy_id ||
                      ''
                  ).slice(0, 20)}
                  defaultProjectTokenPolicyId={
                    (getPolicyIdFromContract(updateProjectModalContract) ||
                      updateProjectModalContract?.policy_id ||
                      '') as string
                  }
                  onClose={() => setUpdateProjectModalContract(null)}
                  onSubmit={(formData) =>
                    handleUpdateProject(updateProjectModalContract, formData)
                  }
                  loading={
                    !!updateProjectModalContract &&
                    updateProjectLoadingPolicyId ===
                      (getPolicyIdFromContract(updateProjectModalContract) ||
                        updateProjectModalContract?.policy_id)
                  }
                  colors={colors}
                  initialDatum={updateProjectModalDatum}
                />
              )}
            </Modal>

            <Modal
              key="create-project-modal"
              show={!!protocolPolicyIdForNewProject}
              onClose={() => setProtocolPolicyIdForNewProject(null)}
              size="lg"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Crear contrato de proyecto
                {protocolPolicyIdForNewProject && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    protocolo: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{protocolPolicyIdForNewProject.slice(0, 20)}…</code>
                  </span>
                )}
              </Modal.Header>
              <CreateProjectFormContent
                protocolPolicyIdLabel={protocolPolicyIdForNewProject?.slice(0, 20) ?? ''}
                onClose={() => setProtocolPolicyIdForNewProject(null)}
                onSubmit={(projectName) => handleCompileProject(projectName)}
                loading={compileProjectLoading}
                colors={colors}
              />
            </Modal>

            <Modal
              key="deploy-reference-script-modal"
              show={!!deployModalContract}
              onClose={() => {
                setDeployModalContract(null);
                setDeployModalDestinationAddress('');
              }}
              size="md"
              position="center"
              className="z-[60]"
            >
              <Modal.Header className="border-b border-gray-200">
                Deploy reference script
                {deployModalContract && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    {getContractNameFromContract(deployModalContract) || 'Contrato'}
                  </span>
                )}
              </Modal.Header>
              <Modal.Body className="space-y-4 pt-4">
                <p className="text-sm text-gray-600">
                  Indica la dirección (destination_address) donde se desplegará el reference script. Puedes usar la de tu billetera o otra.
                </p>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Dirección destino (destination_address)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="addr_test1... o addr1..."
                    value={deployModalDestinationAddress}
                    onChange={(e) => setDeployModalDestinationAddress(e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  className="font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  onClick={() => {
                    setDeployModalContract(null);
                    setDeployModalDestinationAddress('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50`}
                  onClick={() => deployModalContract && handleDeployProject(deployModalContract, deployModalDestinationAddress.trim())}
                  disabled={!deployModalDestinationAddress.trim() || deployLoadingPolicyId === (getPolicyIdFromContract(deployModalContract) || deployModalContract?.policy_id)}
                >
                  {deployModalContract && deployLoadingPolicyId === (getPolicyIdFromContract(deployModalContract) || deployModalContract?.policy_id)
                    ? <LoadingIcon className="w-5 h-5 inline" />
                    : 'Construir tx'}
                </button>
              </Modal.Footer>
            </Modal>
          </div>,
          document.body
        )}

      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType={signType}
      />
    </>
  );
}
