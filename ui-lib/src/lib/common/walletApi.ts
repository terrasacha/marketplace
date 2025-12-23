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


