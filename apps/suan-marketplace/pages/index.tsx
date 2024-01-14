import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Landing = dynamic(() => import('@suan//components/landing/Landing'));
import LoginFromContext from '@suan//store/login-from';
import { useWallet, useAssets } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { MyPage } from '@suan//components/common/types';

const LandingPage: MyPage = (props: any) => {
  const { connected, wallet } = useWallet();
  const [checkingWallet, setCheckingWallet] = useState<string>('uncheck');
  const router = useRouter();
  const { handleLoginFrom } = useContext<any>(LoginFromContext);
  const assets = useAssets() as Array<{ [key: string]: any }>;
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
      <Landing checkingWallet={checkingWallet} />
    </>
  );
};

export default LandingPage;
LandingPage.Layout = 'NoLayout';
