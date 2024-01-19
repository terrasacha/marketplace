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

const MainLayout = ({ children }: PropsWithChildren) => {
  const { connect, connected, disconnect } = useWallet();
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false); // Estado para controlar si Sidebar está abierto o cerrado
  const assets = useAssets() as Array<{ [key: string]: any }>;
  const router = useRouter();

  useEffect(() => {
    let walletName: any = sessionStorage.getItem('preferredWalletSuan');
    if (walletName) {
      connect(walletName);
    } else {
      sessionStorage.removeItem('preferredWalletSuan');
      router.push('/');
    }
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
            appName="Suan"
            image="/images/home-page/suan_logo.png"
            heightLogo={80}
            widthLogo={45}
            poweredBy={false}
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
