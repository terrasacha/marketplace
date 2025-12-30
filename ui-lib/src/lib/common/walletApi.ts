import { toast } from 'sonner';

// Usar rutas API de Next.js como proxy para evitar problemas de CORS
const API_BASE = '/api/wallets';

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

    if (!data.success) {
      const message = data.detail || data.message || 'Error al crear la billetera';
      toast.error(message);
      return { success: false, data, error: message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error al crear billetera:', error);
    const message = error.message || 'Error al conectar con el servidor';
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

    if (!data.success) {
      const message = data.message || 'Error al importar la billetera';
      toast.error(message);
      return { success: false, data, error: message };
    }

    toast.success('Billetera importada correctamente.');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al importar billetera:', error);
    const message = error.message || 'Error al conectar con el servidor';
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

    if (data.success) {
      storeWalletSession(data);
      toast.success('Billetera desbloqueada correctamente.');
      return { success: true, data };
    }

    const message = data.message || 'Error al desbloquear la billetera';
    toast.error(message);
    return { success: false, data, error: message };
  } catch (error: any) {
    console.error('Error al desbloquear la billetera:', error);
    const message = error.message || 'Error al conectar con el servidor';
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

    if (data.success) {
      toast.success(data.message || 'Billetera bloqueada correctamente.');
      return { success: true, data };
    }

    const message = data.message || 'Error al bloquear la billetera';
    toast.error(message);
    return { success: false, data, error: message };
  } catch (error: any) {
    console.error('Error al bloquear la billetera:', error);
    const message = error.message || 'Error al conectar con el servidor';
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

    if (data.success) {
      toast.success('Token renovado correctamente.');
      return { success: true, data };
    }

    const message = data.message || 'Error al refrescar el token';
    toast.error(message);
    return { success: false, data, error: message };
  } catch (error: any) {
    console.error('Error al refrescar el token:', error);
    const message = error.message || 'Error al conectar con el servidor';
    toast.error(message);
    return { success: false, data: null, error: message };
  }
};

export const revokeWalletToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/token/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      toast.success(data.message || 'Sesión cerrada correctamente.');
      return { success: true, data };
    }

    const message = data.message || 'Error al revocar el token';
    toast.error(message);
    return { success: false, data, error: message };
  } catch (error: any) {
    console.error('Error al revocar el token:', error);
    const message = error.message || 'Error al conectar con el servidor';
    toast.error(message);
    return { success: false, data: null, error: message };
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


