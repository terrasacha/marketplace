import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Landing = dynamic(() => import('@terrasacha/components/landing/Landing'));
import LoginFromContext from '@terrasacha/store/login-from';
import { useWallet, useAssets } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { MyPage } from '@terrasacha/components/common/types';
import { getCurrentUser } from 'aws-amplify/auth';
import { getWalletByUser } from '@terrasacha/backend';
import { set } from 'lodash';
const LandingPage: MyPage = (props: any) => {
  const { connected } = useWallet();
  const [checkingWallet, setCheckingWallet] = useState<string>('uncheck');
  const [loading, setLoading] = useState<boolean>(true);
  const [walletcount, setWalletcount] = useState<number>(0);
  const router = useRouter();
  const { handleLoginFrom } = useContext<any>(LoginFromContext);
  const assets = useAssets() as Array<{ [key: string]: any }>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await accessHomeWithWallet();
        if (res) {
          const wallet = await getWalletByUser(res);
          if (wallet && wallet.length > 0) {
            setWalletcount(wallet.length);
            router.push('/home');
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

  useEffect(() => {
    if (connected) {
      setCheckingWallet('checking');
      const matchingAsset =
        assets &&
        assets.filter(
          (asset) =>
            asset.policyId === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
            asset.assetName === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
        );
      if (matchingAsset !== undefined) {
        if (matchingAsset.length > 0) {
          setCheckingWallet('authorized');
          handleLoginFrom({ loginFromRoot: true });
          router.push('/home');
        } else {
          setCheckingWallet('unauthorized');
        }
      }
    } else {
      setCheckingWallet('uncheck');
    }
  }, [connected, assets]);

  return (
    <>
      <Landing
        checkingWallet={checkingWallet}
        loading={loading}
        walletcount={walletcount}
      />
    </>
  );
};

export default LandingPage;
LandingPage.Layout = 'NoLayout';
