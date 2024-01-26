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
import { getWalletByUser } from '@marketplaces/data-access';

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

  useEffect(() => {
    const fetchData = async () => {
      let access = false;

      try {
        const res = await accessHomeWithWallet();

        if (res) {
          const wallet = await getWalletByUser(res);
          if (wallet.length > 0) {
            const address = (wallet[0] as any)?.address;
            console.log(address);
            setAllowAccess(true);
            const response = await fetch(
              'https://93jp7ynsqv.us-east-1.awsapprunner.com/api/v1/wallet/query-wallet/balance/',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify([address]),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Error en la solicitud: ${response.status} - ${response.statusText}`
              );
            }
            const responseData = await response.json();
            setWalletInfo({
              name: (wallet[0] as any)?.name,
              addr: address,
            });
            setBalance(responseData.data[0].balance / 1000000 || 0);
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

  const getBalance = async () => {
    const balance = await wallet.getBalance();
    setBalance(balance[0]['quantity']);
  };
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

export default MainLayout;
