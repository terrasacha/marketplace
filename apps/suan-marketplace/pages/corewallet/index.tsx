// pages/dashboard/index.tsx
import CoreWalletPage from '@marketplaces/ui-lib/src/lib/corewallet/CoreWalletPage';
import { WalletContext } from '@marketplaces/utils-2';
import { MyPage } from '@suan/components/common/types';
import { useContext, useEffect, useState} from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
//import WalletDashboard from '@suan//components/wallet/WalletDashboard';
const CoreWallet: MyPage = (props: any) => {
  const router = useRouter();
  const [allowAccessCW, setAllowAccessCW] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAttributes()
      .then((data: any) => {
        if (
          data['custom:role'] === 'marketplace_admin' &&
          data['custom:subrole'] === process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLocaleLowerCase()
        ) {
          setAllowAccessCW(true);
        } else {
          setAllowAccessCW(false);
        }
      })
      .catch((error) => {
        setAllowAccessCW(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  if (!allowAccessCW) {
    router.push('/home')
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

