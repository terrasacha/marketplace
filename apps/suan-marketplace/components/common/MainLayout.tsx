import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Sidebar, Navbar } from '@marketplaces/ui-lib';
import { useWallet, useAssets, useAddress, useLovelace } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { WalletContext } from '@marketplaces/utils-2';

const initialStatewalletInfo = {
  name: '',
  addr: '',
  externalWallet: false,
};
const MainLayout = ({ children }: PropsWithChildren) => {
  const { connect, connected, disconnect, name, wallet } = useWallet();
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(initialStatewalletInfo);
  const [balance, setBalance] = useState<any>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const assets = useAssets() as Array<{ [key: string]: any }>;
  const address = useAddress();
  const lovelace: any = useLovelace();
  const router = useRouter();

  const { handleWalletData } = useContext<any>(WalletContext);

  useEffect(() => {
    const fetchData = async () => {
      let access = false;

      try {
        const res = await accessHomeWithWallet();

        if (res) {
          const response = await fetch('/api/calls/backend/getWalletByUser', {
            method: 'POST',
            body: res,
          });
          const wallet = await response.json();
          const walletData = await handleWalletData(wallet);
          if (wallet.length > 0) {
            const address = (wallet[0] as any)?.address;
            setAllowAccess(true);
            setWalletInfo({
              name: (wallet[0] as any)?.name,
              addr: address,
            });
            const balance = (parseInt(walletData.balance) / 1000000).toFixed(4) || 0;
            setBalance(balance);
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
    const getBalance = async () => {
      const balance = await wallet.getBalance();
      setBalance((balance[0]['quantity'] / 1000000).toFixed(4) || 0);
    };

    if (connected) {
      const matchingAsset =
        assets &&
        assets.filter(
          (asset) =>
            asset.policyId === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
            asset.assetName === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
        );
      setWalletInfo({
        name: name,
        addr: address,
        externalWallet: true,
      });
      getBalance();
      if (matchingAsset !== undefined) {
        if (matchingAsset.length > 0) {
          setAllowAccess(true);
          getBalance();
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
          <Navbar walletInfo={walletInfo} />
          <Sidebar
            isOpen={isOpen}
            balance={balance}
            onClose={handleSidebarClose}
            user={user}
            appName="Suan"
            image="/images/home-page/suan_logo.png"
            heightLogo={120}
            widthLogo={60}
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

export async function getServerSideProps() {
  const res = await fetch(`https://.../data`);
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}

export default MainLayout;
