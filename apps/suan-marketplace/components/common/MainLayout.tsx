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
          if (wallet.length < 0) return router.push('/');
          if (wallet.length > 0) {
            const walletData = await handleWalletData({
              waleltID: wallet[0].id,
              walletName: wallet[0].name,
              walletAddress: wallet[0].address,
              isWalletBySuan: true,
              isWalletAdmin: wallet[0].isAdmin,
            });
            console.log(walletData, 'walletData mainlayout');
            const walletAddress = wallet[0].address;
            const hasTokenAuthFunction = await checkTokenStakeAddress(
              wallet[0].stake_address
            );
            if (hasTokenAuthFunction) {
              const address = wallet[0].address;
              setAllowAccess(true);
              setWalletInfo({
                name: (wallet[0] as any)?.name,
                addr: address,
              });
              const balance =
                (parseInt(walletData.balance) / 1000000).toFixed(4) || 0;
              setBalance(balance);
              access = true;
            } else {
              sessionStorage.removeItem('preferredWalletSuan');
              disconnect();
              return router.push('/');
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
        console.log(hasTokenAuthFunction, 'hasTokenAuthFunction');
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
    const walletData = await handleWalletData({
      waleltID: walletInfoOnDB.data.id,
      walletName: '',
      walletAddress: walletInfoOnDB.data.address,
      isWalletAdmin: walletInfoOnDB.data.isAdmin,
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
      const data = await response.json();

      await handleWalletData({
        waleltID: data.data.id,
        walletName: '',
        walletAddress: data.data.address,
        isWalletAdmin: false,
      });
      return data;
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
            appName="Suan"
            image="/images/home-page/suan_logo.png"
            heightLogo={120}
            widthLogo={60}
            poweredBy={false}
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
