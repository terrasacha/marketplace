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
  deployReferenceScript,
  type CompileProtocolResponse,
} from '../common/walletApi';

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

/** compilation_params suele contener el policy_id del protocolo del que proviene el proyecto */
const getCompilationParamsFromContract = (c: any): string[] => {
  const raw = c?.compilation_params ?? c?.compilationParams;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return [];
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
  onSubmit: (formData: { protocol_admins: string[]; protocol_fee: number; destination_address?: string }) => void;
  loading: boolean;
  colors: { fuente: string; bgColor: string; hoverBgColor: string };
}) {
  const [protocolAdmins, setProtocolAdmins] = useState('');
  const [protocolFee, setProtocolFee] = useState('');
  const [protocolDestinationAddress, setProtocolDestinationAddress] = useState('');
  const { onClose, onSubmit, loading, colors } = props;

  const handleSubmit = () => {
    const adminsParsed = protocolAdmins.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (adminsParsed.length === 0) {
      toast.error('Ingresa al menos un admin (hash) en protocol_admins.');
      return;
    }
    const feeNum = parseInt(protocolFee, 10);
    if (Number.isNaN(feeNum) || feeNum < 0) {
      toast.error('protocol_fee debe ser un número válido (lovelace).');
      return;
    }
    onSubmit({
      protocol_admins: adminsParsed,
      protocol_fee: feeNum,
      destination_address: protocolDestinationAddress.trim() || undefined,
    });
  };

  return (
    <>
      <Modal.Body className="space-y-4 pt-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">protocol_admins (un hash por línea o separados por coma)</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="hash1, hash2"
            value={protocolAdmins}
            onChange={(e) => setProtocolAdmins(e.target.value)}
          />
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
  const [signType, setSignType] = useState<string>('sendTransaction');
  const [mintedProtocolPolicyIds, setMintedProtocolPolicyIds] = useState<Set<string>>(new Set());
  const [selectedProtocolPolicyId, setSelectedProtocolPolicyId] = useState<string | null>(null);
  const lastMintPolicyIdRef = useRef<string | null>(null);
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

  useEffect(() => {
    if (!hasTokenAcces && walletData) {
      const hasAsset = walletData.assets.some((asset: any) => asset.asset_name === 'SandboxSuanAccess1')

      if (hasAsset) {
        setSendTokenAccess(false)
        setHasTokenAccess(true)
      }
    }
  }, [walletData])

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
    if (signStatus === true && lastMintPolicyIdRef.current) {
      setMintedProtocolPolicyIds((prev) => new Set(prev).add(lastMintPolicyIdRef.current!));
      lastMintPolicyIdRef.current = null;
    }
    setSignTransactionModal((open) => !open);
  };

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

  const handleCompileProtocol = async () => {
    setProtocolCompileLoading(true);
    setProtocolCompileResult(null);
    try {
      const result = await compileProtocol({});
      if (result.success && result.data) {
        setProtocolCompileResult(result.data);
        toast.success(result.data.message || 'Protocolo compilado correctamente.');
        refreshContracts(true);
      }
    } finally {
      setProtocolCompileLoading(false);
    }
  };

  const handleMintProtocol = async (
    policyIdFromRow?: string,
    formData?: { protocol_admins: string[]; protocol_fee: number; destination_address?: string }
  ) => {
    const policyId = policyIdFromRow ?? selectedProtocolPolicyId ?? protocolCompileResult?.protocol_nfts?.policy_id;
    if (!policyId) {
      toast.error('Selecciona un contrato protocolo (policy_id) para mintear.');
      return;
    }
    if (!formData || formData.protocol_admins.length === 0) {
      toast.error('Ingresa al menos un admin (hash) en protocol_admins.');
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
        protocol_admins: formData.protocol_admins,
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
        toast.success('Transacción construida. Revisa el detalle y firma en el modal.');
      }
    } finally {
      setProtocolMintLoading(false);
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
        toast.success('Transacción construida. Revisa el detalle y firma en el modal.');
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
        setCompiledContracts(normalizeToArray(compiledData));
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
      await refreshContracts();
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

    const ok = typeof window !== 'undefined'
      ? window.confirm(`¿Eliminar el contrato con policy_id ${policyId}?`)
      : true;
    if (!ok) return;

    const loadingKey = `delete:${policyId}`;
    setContractActionLoadingKey(loadingKey);
    try {
      const res = await fetch(`/api/contracts/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await safeJson(res);
      if (!res.ok || data?.success === false) {
        const msg =
          data?.error ||
          data?.details?.[0]?.message ||
          'Error al eliminar el contrato';
        toast.error(msg);
        return;
      }

      toast.success('Contrato eliminado correctamente.');
      await refreshContracts();
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
                    onClick={handleCompileProtocol}
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
                            return (
                              <React.Fragment key={mintPolicyId}>
                                <tr
                                  className={`bg-white hover:bg-gray-50 ${isSelected ? 'ring-1 ring-inset ring-blue-200 bg-blue-50/30' : ''}`}
                                >
                                  <td className="px-4 py-2 font-medium text-gray-900">Protocolo</td>
                                  <td className="px-4 py-2">
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-700">Minting</span>
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[10rem]" title={mintPolicyId}>
                                          {mintPolicyId}
                                        </code>
                                        <CopyToClipboard
                                          copyValue={mintPolicyId}
                                          tooltipLabel="Copiar policy_id minting"
                                          iconClassName="h-4 w-4 shrink-0"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-700">Spending</span>
                                        {spendingPolicyId ? (
                                          <>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[10rem]" title={spendingPolicyId}>
                                              {spendingPolicyId}
                                            </code>
                                            <CopyToClipboard
                                              copyValue={spendingPolicyId}
                                              tooltipLabel="Copiar policy_id spending"
                                              iconClassName="h-4 w-4 shrink-0"
                                            />
                                          </>
                                        ) : (
                                          <span className="text-xs text-gray-400">No encontrado</span>
                                        )}
                                      </div>
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

                                            const projSpendingContract = (projectContractsList || []).find((sc: any) => {
                                              const scType = getContractTypeFromContract(sc);
                                              if (scType !== 'spending') return false;
                                              const params = getCompilationParamsFromContract(sc) || [];
                                              return params.includes(projMintPolicyId);
                                            });
                                            const projSpendingPolicyId = projSpendingContract
                                              ? (getPolicyIdFromContract(projSpendingContract) || projSpendingContract.policy_id)
                                              : null;

                                            return (
                                              <li
                                                key={projMintPolicyId || projName}
                                                className="flex flex-col gap-1.5 rounded border border-gray-200 bg-white p-2 text-xs shadow-sm"
                                              >
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  <span className="font-medium text-gray-900">{projName}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 mt-1">
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-semibold text-gray-700">Minting</span>
                                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[9rem]" title={projMintPolicyId}>
                                                      {String(projMintPolicyId || '').slice(0, 20)}…
                                                    </code>
                                                    <CopyToClipboard
                                                      copyValue={projMintPolicyId || ''}
                                                      tooltipLabel="Copiar policy_id minting"
                                                      iconClassName="h-3.5 w-3.5 shrink-0"
                                                    />
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-semibold text-gray-700">Spending</span>
                                                    {projSpendingPolicyId ? (
                                                      <>
                                                        <code className="bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[9rem]" title={projSpendingPolicyId}>
                                                          {String(projSpendingPolicyId || '').slice(0, 20)}…
                                                        </code>
                                                        <CopyToClipboard
                                                          copyValue={projSpendingPolicyId || ''}
                                                          tooltipLabel="Copiar policy_id spending"
                                                          iconClassName="h-3.5 w-3.5 shrink-0"
                                                        />
                                                      </>
                                                    ) : (
                                                      <span className="text-[11px] text-gray-400">No encontrado</span>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="flex justify-end mt-1.5">
                                                  <button
                                                    type="button"
                                                    className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded text-xs px-2.5 py-1 disabled:opacity-50 flex items-center gap-1`}
                                                    onClick={() => openDeployModal(proj)}
                                                    disabled={isDeploying}
                                                    title="Abrir modal para indicar dirección destino y construir tx"
                                                  >
                                                    {isDeploying ? <LoadingIcon className="w-3.5 h-3.5" /> : null}
                                                    Deploy
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

        <div className="col-span-2">
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
        </div>

        {/* <div className="col-span-2">
          <Scripts />
        </div> */}
      </div>

      {/* Modales renderizados en document.body para centrado correcto. Wrapper con key estable evita re-mount y pérdida de foco al escribir. */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div key="core-wallet-modals" data-portal-root>
            <Modal
              key="mint-protocol-modal"
              show={!!(selectedProtocolPolicyId || protocolCompileResult?.protocol_nfts?.policy_id)}
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
                {(selectedProtocolPolicyId || protocolCompileResult?.protocol_nfts?.policy_id) && (
                  <span className="text-gray-500 font-normal text-sm ml-2">
                    policy_id: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{String(selectedProtocolPolicyId || protocolCompileResult?.protocol_nfts?.policy_id).slice(0, 20)}…</code>
                  </span>
                )}
              </Modal.Header>
              <MintProtocolFormContent
                policyIdLabel={String(selectedProtocolPolicyId || protocolCompileResult?.protocol_nfts?.policy_id || '').slice(0, 20)}
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
