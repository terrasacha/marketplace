import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Landing = dynamic(() => import('@suan/components/landing/Landing'));
import { useWallet, useAssets } from '@meshsdk/react';
import { MyPage } from '@suan/components/common/types';
import { getCurrentUser } from 'aws-amplify/auth';
const LandingPage: MyPage = (props: any) => {
  const { connected, wallet } = useWallet();
  const [checkingWallet, setCheckingWallet] = useState<string>('uncheck');
  const [loading, setLoading] = useState<boolean>(true);
  const [walletcount, setWalletcount] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);
  const assets = useAssets() as Array<{ [key: string]: any }>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Access home with wallet
        const walletAccessResponse = await accessHomeWithWallet();

        if (walletAccessResponse) {
          // Fetch wallet by user
          const walletFetchResponse = await fetch(
            '/api/calls/backend/getWalletByUser',
            {
              method: 'POST',
              body: walletAccessResponse,
            }
          );

          const walletData = await walletFetchResponse.json();
          setWalletData(walletData[0]);
          if (walletData && walletData.length > 0) {
            const walletAddress = walletData[0].address;
            const balanceData = await getWalletBalanceByAddress(walletAddress);
            if (balanceData && balanceData.length > 0) {
              const hasTokenAuth = balanceData[0].assets.some(
                (asset: any) =>
                  asset.policy_id ===
                    process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
                  asset.asset_name ===
                    process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
              );
              if (hasTokenAuth) {
                setCheckingWallet('hasTokenAuth');
              } else {
                walletData[0].claimed_token
                  ? setCheckingWallet('alreadyClaimToken')
                  : setCheckingWallet('requestToken');
              }
            } else {
              walletData[0].claimed_token
                ? setCheckingWallet('alreadyClaimToken')
                : setCheckingWallet('requestToken');
            }

            setWalletcount(walletData.length);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const accessHomeWithWallet = async () => {
    try {
      const user = await getCurrentUser();
      return user.userId;
    } catch {
      return false;
    }
  };
  const handleSetCheckingWallet = (data: string) => {
    setCheckingWallet(data);
  };
  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        console.log('assets', assets);

        setCheckingWallet('checking');
        const matchingAsset =
          assets &&
          assets.filter(
            (asset) =>
              asset.policyId === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
              asset.assetName === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
          );
        const changeAddress = await wallet.getChangeAddress();
        const rewardAddresses = await wallet.getRewardAddresses();

        //Checkear si la wallet existe en la DB, si no existe crearla. Si tiene 'matchingasset' enviar claimed_token = true.
        if (matchingAsset !== undefined) {
          const walletExists = await checkIfWalletExist(
            changeAddress,
            rewardAddresses[0],
            matchingAsset.length > 0
          );

          if (walletExists.data.claimed_token) {
            const balanceData = await getWalletBalanceByAddress(
              walletExists.data.address
            );
            const hasTokenAuth = balanceData[0].assets.some(
              (asset: any) =>
                asset.policy_id === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
                asset.asset_name ===
                  process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
            );
            if (hasTokenAuth) {
              setCheckingWallet('hasTokenAuth');
            } else {
              walletExists.data.claimed_token
                ? setCheckingWallet('alreadyClaimToken')
                : setCheckingWallet('requestToken');
            }
          } else {
            setCheckingWallet('requestToken');
          }
          setWalletData(walletExists.data);
          setWalletcount(1);
        }
      } else {
        setCheckingWallet('uncheck');
      }
    };
    fetchData();
  }, [connected, assets]);

  const checkIfWalletExist = async (
    address: string,
    stake_address: string,
    claimed_token: boolean
  ) => {
    const response = await fetch('/api/calls/backend/checkWalletByAddress', {
      method: 'POST',
      body: JSON.stringify({
        address,
      }),
    });
    const walletInfoOnDB = await response.json();
    if (!walletInfoOnDB.data) {
      const response = await fetch('/api/calls/backend/manageExternalWallets', {
        method: 'POST',
        body: JSON.stringify({
          address,
          stake_address,
          claimed_token,
        }),
      });
      const walletData = response.json();
      return walletData;
    }
    return walletInfoOnDB;
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
  return (
    <>
      <Landing
        checkingWallet={checkingWallet}
        handleSetCheckingWallet={handleSetCheckingWallet}
        loading={loading}
        walletcount={walletcount}
        walletData={walletData}
      />
    </>
  );
};

export default LandingPage;
LandingPage.Layout = 'NoLayout';
