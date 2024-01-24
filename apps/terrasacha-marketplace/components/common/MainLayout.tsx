import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import Navbar from '../Navbar';
import { Sidebar } from '@marketplaces/ui-lib';
import { useWallet, useAssets } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { getWalletByUser } from '@marketplaces/data-access';
const MainLayout = ({ children }: PropsWithChildren) => {
  const { connect, connected, disconnect } = useWallet();
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false); // Estado para controlar si Sidebar está abierto o cerrado
  const assets = useAssets() as Array<{ [key: string]: any }>;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      let access = false;

      try {
        const res = await accessHomeWithWallet();

        if (res) {
          const wallet = await getWalletByUser(res);

          if (wallet.length > 0) {
            setAllowAccess(true);
            access = true;
          }
        }

        if (!access) {
          let walletName: any = sessionStorage.getItem('preferredWalletSuan');
          if (walletName) {
            connect(walletName);
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (connected) {
      const matchingAsset =
        assets &&
        assets.filter(
          (asset) =>
            asset.policyId === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
            asset.assetName === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
        );
      if (matchingAsset !== undefined) {
        if (matchingAsset.length > 0) {
          setAllowAccess(true);
        } else {
          sessionStorage.removeItem('preferredWalletSuan');
          disconnect();
          router.push('/');
        }
      }
    }
  }, [connected, assets]);

  const accessHomeWithWallet = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
      return user.userId;
    } catch {
      return false;
    }
  };

  const handleSidebarClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {allowAccess ? (
        <>
          <Navbar />
          <Sidebar
            isOpen={isOpen}
            onClose={handleSidebarClose}
            user={user}
            appName="Terrasacha"
            image="/images/home-page/terrasacha_logo_vertical.png"
            heightLogo={120}
            widthLogo={120}
            poweredBy={true}
          />
          <main className="lg:ml-80">{children}</main>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default MainLayout;
