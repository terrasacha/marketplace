// pages/dashboard/index.tsx
import CoreWalletPage from '@marketplaces/ui-lib/src/lib/corewallet/CoreWalletPage';
import { WalletContext } from '@marketplaces/utils-2';
import { MyPage } from '@suan/components/common/types';
import { useContext, useEffect, useState} from 'react';
import { useRouter } from 'next/router';
//import WalletDashboard from '@suan//components/wallet/WalletDashboard';
const CoreWallet: MyPage = (props: any) => {
  const router = useRouter();
  const { walletRole, walletID } = useContext<any>(WalletContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esperar a que el walletRole esté disponible
    // Si walletID existe pero walletRole es null, puede estar cargando
    if (walletID && walletRole === null) {
      // Esperar un poco más para que se cargue el role
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    setLoading(false);
  }, [walletID, walletRole]);

  // Verificar acceso basado en el role de la wallet
  const allowAccessCW = walletRole === 'core';

  useEffect(() => {
    if (!loading && !allowAccessCW) {
      router.push('/home');
    }
  }, [loading, allowAccessCW, router]);

  if (loading) return null;

  if (!allowAccessCW) {
    return null; // Return null while redirection happens
  }

  return (
    <div className="h-auto w-full p-5">
      <CoreWalletPage />
    </div>
  );
};

CoreWallet.Layout = 'Main';
export default CoreWallet;

