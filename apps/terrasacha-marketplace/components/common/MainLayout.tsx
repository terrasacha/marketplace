import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Sidebar, Navbar } from '@marketplaces/ui-lib';
import { useWallet, useAddress, useLovelace } from '@meshsdk/react';
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
  const { walletData } = useContext<any>(WalletContext);
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(initialStatewalletInfo);
  const [balance, setBalance] = useState<any>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const { handleWalletData } = useContext<any>(WalletContext);
  useEffect(() => {
    if (walletData) {
      setBalance((walletData.balance / 1000000).toFixed(4));
    }
  }, [walletData]);
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
          console.log(wallet, 'wallet a checkear');
          if (wallet.length < 0) return router.push('/');
          if (wallet.length > 0) {
            const walletData = await handleWalletData({
              waleltID: wallet[0].id,
              walletName: wallet[0].name,
              walletAddress: wallet[0].address,
            });
            const walletAddress = wallet[0].address;
            const balanceData = await getWalletBalanceByAddress(walletAddress);
            if (balanceData && balanceData.length > 0) {
              const hasTokenAuth =
                balanceData[0]?.assets.some(
                  (asset: any) =>
                    asset.policy_id ===
                      process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
                    asset.asset_name ===
                      process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
                ) || false;
              if (hasTokenAuth) {
                const address = balanceData[0].address;
                setAllowAccess(true);
                setWalletInfo({
                  name: (wallet[0] as any)?.name,
                  addr: address,
                });
                const balance =
                  (parseInt(balanceData[0].balance) / 1000000).toFixed(4) || 0;
                setBalance(balance);
                access = true;
              }
            }
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
      const fetchData = async () => {
        const changeAddress = await wallet.getChangeAddress();
        const rewardAddresses = await wallet.getRewardAddresses();

        const hasTokenAuthFunction = await checkTokenStakeAddress(
          rewardAddresses[0]
        );
        const walletExists = await checkIfWalletExist(
          changeAddress,
          rewardAddresses[0],
          true
        );
        if (hasTokenAuthFunction) {
          setWalletInfo({
            name: name,
            addr: changeAddress,
            externalWallet: true,
          });
          if (hasTokenAuthFunction) {
            setAllowAccess(true);
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            disconnect();
            return router.push('/');
          }
        }
      };
      fetchData();
    }
  }, [connected]);

  const checkTokenStakeAddress = async (rewardAddresses: any) => {
    const response = await fetch('/api/calls/backend/checkTokenStakeAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rewardAddresses),
    });
    const hasTokenStakeAddress = await response.json();
    return hasTokenStakeAddress;
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
    return balanceData;
  };
  const checkIfWalletExist = async (
    address: string,
    stake_address: string,
    claimed_token: boolean
  ) => {
    const response = await fetch('/api/calls/backend/checkWalletByAddress', {
      method: 'POST',
      body: JSON.stringify({
        stake_address,
      }),
    });
    const walletInfoOnDB = await response.json();
    console.log(walletInfoOnDB, 'walletInfoOnDB a checkear');
    const walletData = await handleWalletData({
      waleltID: walletInfoOnDB.data.id,
      walletName: '',
      walletAddress: walletInfoOnDB.data.address,
    });
    if (!walletInfoOnDB.data) {
      const response = await fetch('/api/calls/backend/manageExternalWallets', {
        method: 'POST',
        body: JSON.stringify({
          address,
          stake_address,
          claimed_token,
        }),
      });
      const walletData = await response.json();
      await handleWalletData([walletData.data]);
      return walletData;
    }
    return walletInfoOnDB;
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
            appName="Terrasacha"
            image="/images/home-page/terrasacha_logo_vertical.png"
            heightLogo={60}
            widthLogo={120}
            poweredBy={true}
          />
          <main className="lg:ml-80 mt-20">{children}</main>
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
