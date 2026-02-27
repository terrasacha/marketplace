import { toast } from 'sonner';

// Usar rutas API de Next.js como proxy para evitar problemas de CORS
const API_BASE = '/api/wallets';

type WalletApiErrorType = 'client' | 'server' | 'network' | 'unknown';

interface WalletApiErrorInfo {
  message: string;
  type: WalletApiErrorType;
  status?: number;
  details?: any;
}

/**
 * Extrae y normaliza el mensaje de error devuelto por el API de billeteras.
 * Soporta las formas específicas:
 * - 422: { detail: [{ loc, msg, type }] }
 * - 500: { success: false, error, details: [{ code, message, field }] }
 * - Otros 4xx (400-421, 423-499): { success: false, error, details: [...] }
 * - Otros 5xx (501-599): { detail: [...] } u otros formatos
 */
const parseWalletApiError = (
  response: Response | null,
  data: any
): WalletApiErrorInfo => {
  const status = response?.status;

  // Errores de red / sin respuesta
  if (!response) {
    const message =
      data?.message ||
      'Error de red al conectar con el servidor de billeteras';
    return {
      message,
      type: 'network',
    };
  }

  // 422 – Unprocessable Entity (validación)
  // Siempre devuelve: { detail: [{ loc, msg, type }] }
  if (status === 422) {
    const firstDetail = Array.isArray(data?.detail) && data.detail.length > 0
      ? data.detail[0]
      : null;

    const message =
      firstDetail?.msg ||
      data?.message ||
      'Error de validación en la solicitud';

    return {
      message,
      type: 'client',
      status: 422,
      details: data?.detail ?? data,
    };
  }

  // 500 – Internal Server Error
  // Siempre devuelve: { success: false, error, details: [{ code, message, field }] }
  if (status === 500) {
    const baseMessage =
      data?.error ||
      data?.message ||
      'Error interno del servidor de billeteras';

    const firstDetail =
      Array.isArray(data?.details) && data.details.length > 0
        ? data.details[0]
        : null;

    const message = firstDetail?.message || baseMessage;

    return {
      message,
      type: 'server',
      status: 500,
      details: data?.details ?? data,
    };
  }

  // Otros 4xx (400-421, 423-499) – errores del cliente
  if (status && status >= 400 && status < 500) {
    const baseMessage =
      data?.error ||
      data?.detail ||
      data?.message ||
      'Error al procesar la solicitud de billetera';

    const firstDetail =
      Array.isArray(data?.details) && data.details.length > 0
        ? data.details[0]
        : null;

    const message = firstDetail?.message || baseMessage;

    return {
      message,
      type: 'client',
      status,
      details: data?.details ?? data,
    };
  }

  // Otros 5xx (501-599) – errores del servidor
  if (status && status >= 500) {
    // Puede venir como { detail: [...] } u otros formatos
    const firstDetail = Array.isArray(data?.detail) && data.detail.length > 0
      ? data.detail[0]
      : null;

    const message =
      firstDetail?.msg ||
      data?.error ||
      data?.message ||
      'Error interno del servidor de billeteras';

    return {
      message,
      type: 'server',
      status,
      details: data?.detail ?? data?.details ?? data,
    };
  }

  // Caso genérico / desconocido
  const genericMessage =
    data?.detail || data?.message || data?.error || 'Error desconocido';

  return {
    message: genericMessage,
    type: 'unknown',
    status,
    details: data,
  };
};

export interface WalletSession {
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  expires_in: number;
  token_type: string;
  wallet_id: string;
  wallet_name?: string;
  wallet_role?: string;
}

export interface CreateWalletPayload {
  name: string;
  network: 'testnet' | 'mainnet';
  password: string;
  userId?: string;
}

export interface ImportWalletPayload {
  mnemonic: string;
  name: string;
  network: 'testnet' | 'mainnet';
  password: string;
}

export const storeWalletSession = (session: WalletSession) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('wallet_session', JSON.stringify(session));
  } catch (err) {
    console.error('No se pudo almacenar la sesión de la billetera:', err);
  }
};

/**
 * Obtiene el access_token almacenado en localStorage
 * @returns access_token o null si no está disponible
 */
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = window.localStorage.getItem('wallet_session');
    if (sessionStr) {
      const session: WalletSession = JSON.parse(sessionStr);
      return session.access_token || null;
    }
  } catch (err) {
    console.error('Error al obtener el access_token:', err);
  }
  return null;
};

export const createWallet = async (payload: CreateWalletPayload) => {
  try {
    const response = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error al crear billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const importWallet = async (payload: ImportWalletPayload) => {
  try {
    const response = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    toast.success('Billetera importada correctamente.');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al importar billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const unlockWallet = async (walletId: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE}/${walletId}/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    storeWalletSession(data);
    // Toast removido de aquí - se muestra en el componente que llama a esta función
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al desbloquear la billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const lockWallet = async (walletId: string) => {
  try {
    const response = await fetch(`${API_BASE}/${walletId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    toast.success(data.message || 'Billetera bloqueada correctamente.');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al bloquear la billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const refreshWalletToken = async (refreshToken: string) => {
  try {
    const response = await fetch(`${API_BASE}/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    toast.success('Token renovado correctamente.');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al refrescar el token:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const revokeWalletToken = async () => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      // Si no hay token, solo limpiar la sesión local y retornar éxito
      // Esto puede pasar si la sesión ya expiró o fue limpiada
      console.log('No se encontró access_token, limpiando sesión local');
      return { success: true, data: null };
    }

    const response = await fetch(`${API_BASE}/token/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      // Si el error es 401, probablemente el token ya expiró, solo limpiar localmente
      if (response.status === 401) {
        console.log('Token expirado o inválido, limpiando sesión local');
        return { success: true, data: null };
      }
      const { message } = parseWalletApiError(response, data);
      // No mostrar toast de error si es 401, es esperado cuando el token expiró
      if (response.status !== 401) {
        toast.error(message);
      }
      return { success: false, data, error: message };
    }

    toast.success(data.message || 'Sesión cerrada correctamente.');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al revocar el token:', error);
    // En caso de error de red, aún así retornar éxito para limpiar localmente
    return { success: true, data: null };
  }
};

/**
 * Limpia todos los datos de sesión de wallet del localStorage
 */
export const clearWalletSession = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('wallet_session');
    window.localStorage.removeItem('wallet_session_key');
    window.localStorage.removeItem('wallet_frontend_session_id');
    window.localStorage.removeItem('wallet_session_expires_at');
  } catch (err) {
    console.error('Error al limpiar la sesión de wallet:', err);
  }
};

/**
 * Función helper para realizar signout completo: revoca token de wallet, limpia sesión y cierra sesión de AWS
 * @param signOutFn Función de signOut de AWS Amplify (opcional, se importa automáticamente si no se proporciona)
 * @returns Promise que se resuelve cuando el proceso de signout está completo
 */
export const performWalletSignOut = async (signOutFn?: () => Promise<void>) => {
  try {
    // 1. Revocar el token de la wallet
    await revokeWalletToken();
    
    // 2. Limpiar datos de sesión de wallet del localStorage
    clearWalletSession();
    
    // 3. Cerrar sesión de AWS Amplify si se proporciona la función
    if (signOutFn) {
      await signOutFn();
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error durante el signout de wallet:', error);
    // Aún así limpiar la sesión local
    clearWalletSession();
    return { success: false, error: error.message };
  }
};

/**
 * Genera una session key aleatoria usando crypto.getRandomValues (equivalente a crypto.randomBytes en Node.js)
 * @returns Session key en formato base64url
 */
export const generateSessionKey = (): string => {
  if (typeof window === 'undefined' || !window.crypto) {
    throw new Error('crypto.getRandomValues no está disponible');
  }

  // Generar 32 bytes aleatorios (256 bits)
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);

  // Convertir a base64url (similar a base64 pero URL-safe)
  // Reemplazar caracteres no seguros para URLs
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Almacena la sesión de auto-unlock en el backend
 * @param walletId ID de la billetera
 * @param userId ID del usuario (de AWS Amplify)
 * @param password Contraseña de la billetera (para verificación)
 * @param sessionKey Session key generada por el frontend
 * @param frontendSessionId ID de sesión del frontend
 * @param expiresHours Horas de expiración (default: 24)
 */
export const storeSession = async (
  walletId: string,
  userId: string,
  password: string,
  sessionKey: string,
  frontendSessionId: string,
  expiresHours: number = 24
) => {
  try {
    const response = await fetch(`${API_BASE}/${walletId}/session/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        password,
        session_key: sessionKey,
        frontend_session_id: frontendSessionId,
        expires_hours: expiresHours,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Almacenar session_key y frontend_session_id en localStorage
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('wallet_session_key', sessionKey);
          window.localStorage.setItem('wallet_frontend_session_id', frontendSessionId);
          window.localStorage.setItem('wallet_session_expires_at', data.expires_at || '');
        } catch (err) {
          console.error('No se pudo almacenar la session key:', err);
        }
      }
      return { success: true, data };
    }

    const message = data.message || 'Error al almacenar la sesión';
    toast.error(message);
    return { success: false, data, error: message };
  } catch (error: any) {
    console.error('Error al almacenar la sesión:', error);
    const message = error.message || 'Error al conectar con el servidor';
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Desbloquea automáticamente la billetera usando la sesión almacenada (sin requerir contraseña)
 * @param walletId ID de la billetera
 */
export const autoUnlockWallet = async (walletId: string) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('localStorage no está disponible');
    }

    const sessionKey = window.localStorage.getItem('wallet_session_key');
    const frontendSessionId = window.localStorage.getItem('wallet_frontend_session_id');

    if (!sessionKey || !frontendSessionId) {
      const message = 'No se encontró la sesión de auto-unlock. Por favor, desbloquea la billetera manualmente.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const response = await fetch(`${API_BASE}/${walletId}/auto-unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
        'X-Frontend-Session-ID': frontendSessionId,
      },
    });

    const data = await response.json();

    if (data.success) {
      storeWalletSession(data);
      toast.success('Billetera desbloqueada automáticamente.');
      return { success: true, data };
    }

    const message = data.message || 'Error al desbloquear automáticamente la billetera';
    toast.error(message);
    return { success: false, data, error: message };
  } catch (error: any) {
    console.error('Error al desbloquear automáticamente la billetera:', error);
    const message = error.message || 'Error al conectar con el servidor';
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const getWalletBalance = async (
  walletId: string,
  limitAddresses?: number
) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Construir URL con query parameters
    let url = `${API_BASE}/${walletId}/balance`;
    const queryParams = new URLSearchParams();
    if (limitAddresses !== undefined) {
      queryParams.append('limit_addresses', limitAddresses.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta (estructura según documentación)
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener el balance de la billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Obtiene las direcciones de una billetera
 * @param walletId ID de la billetera
 * @param count Número de direcciones a obtener (opcional)
 * @returns Objeto con success, data (wallet_name, addresses, count) o error
 */
export const getWalletAddresses = async (
  walletId: string,
  count?: number
) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Construir URL con query parameters
    let url = `${API_BASE}/${walletId}/addresses`;
    const queryParams = new URLSearchParams();
    if (count !== undefined) {
      queryParams.append('count', count.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta (estructura según documentación)
    // { wallet_name, addresses: [{ index, path, enterprise_address, staking_address }], count }
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener las direcciones de la billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Obtiene los UTXOs (Unspent Transaction Outputs) de una billetera
 * @param walletId ID de la billetera
 * @param addressIndex Índice de la dirección (opcional)
 * @param minAda Cantidad mínima de ADA requerida (opcional)
 * @returns Objeto con success, data (UTXOs) o error
 */
export const getWalletUtxos = async (
  walletId: string,
  addressIndex?: number,
  minAda?: number
) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Construir body con parámetros opcionales
    const body: any = {};
    if (addressIndex !== undefined) {
      body.address_index = addressIndex;
    }
    if (minAda !== undefined) {
      body.min_ada = minAda;
    }

    const response = await fetch(`${API_BASE}/${walletId}/utxos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener los UTXOs de la billetera:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Interfaz para los parámetros de construcción de transacción
 */
export interface BuildTransactionPayload {
  amount_ada: number;
  to_address: string;
  from_address_index?: number;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Interfaz para la respuesta exitosa de buildTransaction
 */
export interface BuildTransactionResponse {
  amount_ada: number;
  amount_lovelace: number;
  estimated_fee_ada: number;
  estimated_fee_lovelace: number;
  from_address: string;
  status: string;
  success: boolean;
  to_address: string;
  transaction_id: string;
  tx_cbor: string;
  tx_hash: string;
}

/**
 * Construye una transacción para enviar ADA
 * @param payload Parámetros de la transacción (amount_ada, to_address, from_address_index opcional, metadata opcional)
 * @returns Objeto con success, data (transaction_id, tx_cbor, tx_hash, etc.) o error
 */
export const buildTransaction = async (
  payload: BuildTransactionPayload
) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Validar campos requeridos
    if (payload.amount_ada === undefined || payload.to_address === undefined) {
      const message = 'amount_ada y to_address son campos requeridos';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const response = await fetch('/api/transactions/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta
    return { success: true, data: data as BuildTransactionResponse };
  } catch (error: any) {
    console.error('Error al construir la transacción:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Interfaz para los parámetros de firma y envío de transacción
 */
export interface SignAndSubmitTransactionPayload {
  password: string;
  transaction_id: string;
}

/**
 * Interfaz para la respuesta exitosa de signAndSubmitTransaction
 */
export interface SignAndSubmitTransactionResponse {
  explorer_url: string;
  signed_at: string;
  status: string;
  submitted_at: string;
  success: boolean;
  transaction_id: string;
  tx_hash: string;
}

/**
 * Firma y envía una transacción previamente construida
 * @param payload Parámetros de la transacción (password, transaction_id)
 * @returns Objeto con success, data (explorer_url, tx_hash, status, etc.) o error
 */
export const signAndSubmitTransaction = async (
  payload: SignAndSubmitTransactionPayload
) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Validar campos requeridos
    if (payload.password === undefined || payload.transaction_id === undefined) {
      const message = 'password y transaction_id son campos requeridos';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const response = await fetch('/api/transactions/sign-and-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      // No mostrar toast automáticamente para errores de contraseña
      // El componente manejará estos casos con mensajes más específicos
      const isPasswordError = message.toLowerCase().includes('password') || 
                              message.toLowerCase().includes('contraseña') ||
                              message.toLowerCase().includes('incorrect') ||
                              message.toLowerCase().includes('incorrecta');
      if (!isPasswordError) {
        toast.error(message);
      }
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta
    return { success: true, data: data as SignAndSubmitTransactionResponse };
  } catch (error: any) {
    console.error('Error al firmar y enviar la transacción:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Interfaz para la respuesta de información de billetera
 */
export interface WalletInfoResponse {
  id: string;
  name: string;
  network: string;
  enterprise_address: string;
  staking_address: string;
  role: string;
  is_locked: boolean;
  is_default: boolean;
  created_at: string;
}

/**
 * Obtiene la información de una billetera por su ID
 * @param walletId ID de la billetera
 * @returns Objeto con success, data (WalletInfoResponse) o error
 */
export const getWalletInfo = async (
  walletId: string
): Promise<{ success: boolean; data: WalletInfoResponse | null; error?: string }> => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      return { success: false, data: null, error: message };
    }

    // Validar que walletId esté presente
    if (!walletId) {
      const message = 'walletId es un campo requerido';
      return { success: false, data: null, error: message };
    }

    const response = await fetch(`/api/wallets/${walletId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      return { success: false, data: null, error: message };
    }

    // Respuesta 2xx correcta
    return { success: true, data: data as WalletInfoResponse };
  } catch (error: any) {
    console.error('Error al obtener información de la billetera:', error);
    const { message } = parseWalletApiError(null, error);
    return { success: false, data: null, error: message };
  }
};

/**
 * Interfaz para los parámetros opcionales de historial de transacciones
 */
export interface TransactionHistoryParams {
  tx_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Interfaz para una transacción en el historial
 */
export interface TransactionHistoryItem {
  id: string;
  tx_hash: string;
  tx_type: string;
  status: string;
  from_address: string;
  to_address: string;
  amount_lovelace: number;
  amount_ada: number;
  fee_lovelace: number;
  explorer_url: string;
  submitted_at: string;
  confirmed_at: string | null;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Interfaz para la respuesta exitosa de getTransactionHistory
 */
export interface TransactionHistoryResponse {
  transactions: TransactionHistoryItem[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/**
 * Obtiene el historial de transacciones
 * @param params Parámetros opcionales (tx_type, status, limit, offset)
 * @returns Objeto con success, data (transactions, total, limit, offset, has_more) o error
 */
export const getTransactionHistory = async (
  params?: TransactionHistoryParams
) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Construir URL con query parameters
    let url = '/api/transactions/history';
    const queryParams = new URLSearchParams();
    if (params?.tx_type !== undefined) {
      queryParams.append('tx_type', params.tx_type);
    }
    if (params?.status !== undefined) {
      queryParams.append('status', params.status);
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta
    return { success: true, data: data as TransactionHistoryResponse };
  } catch (error: any) {
    console.error('Error al obtener el historial de transacciones:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

/**
 * Interfaz para un input de transacción
 */
export interface TransactionInput {
  tx_id: string;
  output_index: number;
  address: string;
  amount_lovelace: number;
}

/**
 * Interfaz para un output de transacción
 */
export interface TransactionOutput {
  address: string;
  amount_lovelace: number;
  amount_ada: number;
  assets?: {
    [key: string]: any;
  };
}

/**
 * Interfaz para la respuesta exitosa de getTransactionByHash
 */
export interface TransactionDetailResponse {
  tx_hash: string;
  status: string;
  tx_type: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  fee_lovelace: number;
  fee_ada: number;
  block_height: number | null;
  block_time: string | null;
  confirmations: number;
  metadata?: {
    [key: string]: any;
  };
  submitted_at: string;
  confirmed_at: string | null;
  explorer_url: string;
}

/**
 * Obtiene los detalles de una transacción por su hash
 * @param txHash Hash de la transacción
 * @returns Objeto con success, data (detalles completos de la transacción) o error
 */
export const getTransactionByHash = async (txHash: string) => {
  try {
    // Obtener access_token para Authorization header
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message = 'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    // Validar que txHash esté presente
    if (!txHash || txHash.trim() === '') {
      const message = 'tx_hash es un parámetro requerido';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const response = await fetch(`/api/transactions/${txHash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data, error: message };
    }

    // Respuesta 2xx correcta
    return { success: true, data: data as TransactionDetailResponse };
  } catch (error: any) {
    console.error('Error al obtener los detalles de la transacción:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

// --- Compile protocol (contracts/compile-protocol) ---

/**
 * Payload para compilar el protocolo (POST /api/contracts/compile-protocol)
 */
export interface CompileProtocolPayload {
  /** Referencia UTxO opcional (ej. "txHash:index") */
  utxo_ref?: string;
}

/**
 * UTxO usado para la compilación en la respuesta exitosa
 */
export interface CompilationUtxo {
  amount_ada: number;
  amount_lovelace: number;
  index: number;
  tx_id: string;
}

/**
 * Contrato compilado (protocol o protocol_nfts) en la respuesta
 */
export interface CompiledContractInfo {
  cbor_hex: string;
  compiled_at: string;
  contract_name: string;
  contract_type: string;
  policy_id: string;
  version: number;
  mainnet_address?: string;
  testnet_address?: string;
}

/**
 * Respuesta exitosa de compile-protocol
 */
export interface CompileProtocolResponse {
  compilation_utxo: CompilationUtxo;
  message: string;
  protocol: CompiledContractInfo;
  protocol_nfts: CompiledContractInfo;
  skipped: boolean;
  success: true;
}

/**
 * Compila el protocolo (contratos protocol y protocol_nfts).
 * Llama a POST /api/contracts/compile-protocol (opcional: utxo_ref).
 *
 * @param payload - { utxo_ref? }
 * @returns Objeto con success, data (CompileProtocolResponse) o error
 */
export const compileProtocol = async (
  payload: CompileProtocolPayload = {}
): Promise<{
  success: boolean;
  data: CompileProtocolResponse | null;
  error?: string;
}> => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message =
        'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const body: { utxo_ref?: string } = {};
    if (payload.utxo_ref != null && payload.utxo_ref.trim() !== '') {
      body.utxo_ref = payload.utxo_ref;
    }

    const response = await fetch('/api/contracts/compile-protocol', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    if (data?.success !== true) {
      const message =
        data?.error || data?.message || 'Error al compilar el protocolo';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    return { success: true, data: data as CompileProtocolResponse };
  } catch (error: any) {
    console.error('Error al compilar protocolo:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

// --- Compile project (contracts/compile-project) ---

/**
 * Payload para compilar un proyecto (POST /api/contracts/compile-project)
 */
export interface CompileProjectPayload {
  /** Nombre del proyecto (ej. reforestation_guaviare) */
  project_name: string;
  /** Policy ID de los NFTs del protocolo */
  protocol_nfts_policy_id: string;
}

/**
 * Respuesta exitosa de compile-project
 */
export interface CompileProjectResponse {
  compilation_utxo: CompilationUtxo;
  message: string;
  project: CompiledContractInfo;
  project_name: string;
  project_nfts: CompiledContractInfo;
  protocol_nfts_policy_id: string;
  skipped: boolean;
  success: true;
}

/**
 * Compila los contratos de un proyecto (project + project_nfts) para el protocolo indicado.
 * Llama a POST /api/contracts/compile-project con project_name y protocol_nfts_policy_id.
 *
 * @param payload - { project_name, protocol_nfts_policy_id }
 * @returns Objeto con success, data (CompileProjectResponse) o error
 */
export const compileProject = async (
  payload: CompileProjectPayload
): Promise<{
  success: boolean;
  data: CompileProjectResponse | null;
  error?: string;
}> => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message =
        'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const project_name = payload.project_name?.trim() ?? '';
    const protocol_nfts_policy_id = payload.protocol_nfts_policy_id?.trim() ?? '';

    if (!project_name) {
      const message = 'project_name es un parámetro requerido';
      toast.error(message);
      return { success: false, data: null, error: message };
    }
    if (!protocol_nfts_policy_id) {
      const message = 'protocol_nfts_policy_id es un parámetro requerido';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const response = await fetch('/api/contracts/compile-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        project_name,
        protocol_nfts_policy_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    if (data?.success !== true) {
      const message =
        data?.error || data?.message || 'Error al compilar el proyecto';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    return { success: true, data: data as CompileProjectResponse };
  } catch (error: any) {
    console.error('Error al compilar proyecto:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

// --- Deploy reference script (contracts/deploy-reference-script) ---

/**
 * Payload para desplegar un reference script (POST /api/contracts/deploy-reference-script)
 */
export interface DeployReferenceScriptPayload {
  /** Dirección destino donde quedará el UTxO de referencia */
  destination_address: string;
  /** Policy ID del contrato a usar como reference script */
  policy_id: string;
}

/**
 * Respuesta exitosa de deploy-reference-script
 */
export interface DeployReferenceScriptResponse {
  contract_name: string;
  contract_policy_id: string;
  destination_address: string;
  fee_lovelace: number;
  inputs: any[];
  min_lovelace: number;
  outputs: any[];
  reference_output_index: number;
  success: true;
  transaction_id: string;
  tx_cbor: string;
}

/**
 * Despliega un reference script para un contrato ya compilado.
 * Llama a POST /api/contracts/deploy-reference-script con destination_address y policy_id.
 *
 * @param payload - { destination_address, policy_id }
 * @returns Objeto con success, data (DeployReferenceScriptResponse) o error
 */
export const deployReferenceScript = async (
  payload: DeployReferenceScriptPayload
): Promise<{
  success: boolean;
  data: DeployReferenceScriptResponse | null;
  error?: string;
}> => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message =
        'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const destination_address = payload.destination_address?.trim() ?? '';
    const policy_id = payload.policy_id?.trim() ?? '';

    if (!destination_address) {
      const message = 'destination_address es un parámetro requerido';
      toast.error(message);
      return { success: false, data: null, error: message };
    }
    if (!policy_id) {
      const message = 'policy_id es un parámetro requerido';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const response = await fetch('/api/contracts/deploy-reference-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        destination_address,
        policy_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    if (data?.success !== true) {
      const message =
        data?.error ||
        data?.message ||
        'Error al desplegar el reference script';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    return { success: true, data: data as DeployReferenceScriptResponse };
  } catch (error: any) {
    console.error('Error al desplegar reference script:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

// --- Mint protocol (contracts/[policyId]/mint-protocol) ---

/**
 * Payload para mintear el protocolo (POST /api/contracts/{policy_id}/mint-protocol)
 */
export interface MintProtocolPayload {
  /** ID del oráculo (opcional) */
  oracle_id?: string;
  /** Lista de proyectos (opcional) */
  projects?: any[];
  /** Lista de hashes de admins del protocolo */
  protocol_admins: string[];
  /** Fee del protocolo en lovelace */
  protocol_fee: number;
  /** Dirección de destino (opcional) */
  destination_address?: string;
}

/**
 * Respuesta exitosa de mint-protocol
 */
export interface MintProtocolResponse {
  compilation_utxo: CompilationUtxo;
  fee_lovelace: number;
  inputs: any[];
  minting_policy_id: string;
  outputs: any[];
  protocol_contract_address: string;
  protocol_token_name: string;
  success: true;
  transaction_id: string;
  tx_cbor: string;
  user_token_name: string;
}

/**
 * Mintea el protocolo para el policy_id indicado.
 * Llama a POST /api/contracts/{policyId}/mint-protocol con oracle_id, projects, protocol_admins, protocol_fee y opcionalmente destination_address.
 *
 * @param policyId - Policy ID del contrato (obligatorio)
 * @param payload - Body: oracle_id?, projects?, protocol_admins, protocol_fee, destination_address?
 * @returns Objeto con success, data (MintProtocolResponse) o error
 */
export const mintProtocol = async (
  policyId: string,
  payload: MintProtocolPayload
): Promise<{
  success: boolean;
  data: MintProtocolResponse | null;
  error?: string;
}> => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      const message =
        'No se encontró el token de acceso. Por favor, desbloquea la billetera.';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    if (!policyId || policyId.trim() === '') {
      const message = 'policy_id es un parámetro requerido';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    if (!Array.isArray(payload.protocol_admins)) {
      const message = 'protocol_admins debe ser un array';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    const body: {
      oracle_id?: string;
      projects?: any[];
      protocol_admins: string[];
      protocol_fee: number;
      destination_address?: string;
    } = {
      protocol_admins: payload.protocol_admins,
      protocol_fee: payload.protocol_fee,
    };
    if (payload.oracle_id != null && payload.oracle_id !== '') {
      body.oracle_id = payload.oracle_id;
    }
    if (payload.projects != null && payload.projects.length > 0) {
      body.projects = payload.projects;
    }
    if (
      payload.destination_address != null &&
      payload.destination_address.trim() !== ''
    ) {
      body.destination_address = payload.destination_address;
    }

    const response = await fetch(
      `/api/contracts/${encodeURIComponent(policyId)}/mint-protocol`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const { message } = parseWalletApiError(response, data);
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    if (data?.success !== true) {
      const message =
        data?.error || data?.message || 'Error al mintear el protocolo';
      toast.error(message);
      return { success: false, data: null, error: message };
    }

    return { success: true, data: data as MintProtocolResponse };
  } catch (error: any) {
    console.error('Error al mintear protocolo:', error);
    const { message } = parseWalletApiError(null, error);
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};


