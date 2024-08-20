
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Landing from '@terrasacha/components/landing/Landing';

import { useWallet } from '@meshsdk/react';
import { MyPage } from '@terrasacha/components/common/types';
import { getCurrentUser } from 'aws-amplify/auth';
const LandingPage: MyPage = (props: any) => {
  const { connected, wallet } = useWallet();
  const [checkingWallet, setCheckingWallet] = useState<string>('uncheck');
  const [loading, setLoading] = useState<boolean>(true);
  const [walletcount, setWalletcount] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const walletAccessResponse = await accessHomeWithWallet();
        if (walletAccessResponse) {
          const walletFetchResponse = await fetch(
            '/api/calls/backend/getWalletByUser',
            {
              method: 'POST',
              body: walletAccessResponse,
            }
          );
          const walletData = await walletFetchResponse.json();
          console.log(walletData,'walletData')
          setWalletData(walletData[0]);
          if (walletData && walletData.length > 0) {
            console.log( walletData[0].address, ' walletData[0].address')
            const hasTokenAuthFunction = await checkTokenStakeAddress(
              walletData[0].address
            );
            console.log(hasTokenAuthFunction, 'hasTokenAuthFunction');
            if (hasTokenAuthFunction) {
              setCheckingWallet('hasTokenAuth');
            } else {
              walletData[0].claimed_token
                ? setCheckingWallet('alreadyClaimToken')
                : setCheckingWallet('alreadyClaimToken'); //requestToken. cambio para hacer la solicitud del token automaticamente
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
        setCheckingWallet('checking');
        const changeAddress = await wallet.getChangeAddress();
        const rewardAddresses = await wallet.getRewardAddresses();
        const hasTokenAuthFunction = await checkTokenStakeAddress(
          rewardAddresses[0]
        );
        console.log(hasTokenAuthFunction, 'hasTokenAuthFunction');
        const walletExists = await checkIfWalletExist(
          changeAddress,
          rewardAddresses[0],
          hasTokenAuthFunction
        );

        if (walletExists.data.claimed_token) {
          if (hasTokenAuthFunction) {
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
      } else {
        setCheckingWallet('uncheck');
      }
    };
    fetchData();
  }, [connected]);

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
    console.log(walletInfoOnDB.data, 'walletInfoOnDB.data');
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
  
  const checkTokenStakeAddress = async (rewardAddresses: any) => {
    const response = await fetch('/api/calls/backend/checkTokenStakeAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rewardAddresses),
    });
    const hasTokenStakeAddress = await response.json();
    console.log(hasTokenStakeAddress, 'checkTokenStakeAddress')
    return hasTokenStakeAddress;
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
