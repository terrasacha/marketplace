import React, { useEffect, useState } from 'react';
import { MyPage } from '@cauca/components/common/types';
import Image from 'next/image';
import NewWallet from '@cauca/components/generate-wallet/NewWallet';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/router';
import AlreadyHasWallet from '@cauca/components/generate-wallet/AlreadyHasWallet';

const GenerateWalletPage: MyPage = (props: any) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null) as any;
  const [wallet, setWallet] = useState(null) as any;
  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      if (!res) {
        setIsAuthenticated(false);
        return router.push('/');
      }
      setIsAuthenticated(true);
      fetch('/api/calls/backend/getWalletByUser',{
        method: 'POST',
        body: res,
      })
      .then(response => response.json())
      .then((data) => {
        setWallet(data);
      });
    });
  }, []);
  Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedIn':
        currentAuthenticatedUser().then((res) => {
          setIsAuthenticated(res);
        });
        break;
      case 'signedOut':
        currentAuthenticatedUser().then((res) => {
          setIsAuthenticated(res);
        });
        break;
    }
  });

  async function currentAuthenticatedUser() {
    try {
      const { userId } = await getCurrentUser();
      return userId;
    } catch (err) {
      return false;
    }
  }
  if (!wallet) return null;
  return (
    <div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center">
  <div className="absolute inset-0 z-0">
    <Image
      priority={true}
      src="/images/home-page/fondo_login.avif"
      alt="landing-suan-image"
      layout="fill"
      objectFit="cover"
      objectPosition="center"
      className="z-0"
    />
  </div>
  <div className="relative z-10 mt-10 mb-10 w-[50rem] h-auto">
    {isAuthenticated && wallet.length === 0 && <NewWallet />}
    {isAuthenticated && wallet.length > 0 && <AlreadyHasWallet />}
  </div>
</div>
  );
};

export default GenerateWalletPage;
GenerateWalletPage.Layout = 'NoLayout';
