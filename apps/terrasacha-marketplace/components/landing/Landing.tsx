import {
  LoadingPage,
  NavbarLanding,
  RedirectToHome,
} from '@marketplaces/ui-lib';
import { useState, useEffect } from 'react';
import { WelcomeCard } from '@marketplaces/ui-lib';
import Image from 'next/image';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
const Login = (props: any) => {
  const { loading, walletcount, checkingWallet } = props;
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  async function currentAuthenticatedUser() {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (err) {
      console.log(err);
    }
  }
  Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedOut':
        setUser(null);
        break;
    }
  });
  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.avif"
        alt="landing-terrasacha-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <NavbarLanding user={user} />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        {loading ? (
          <LoadingPage message="Consultando información del usuario" />
        ) : walletcount === 0? (
          <WelcomeCard
            checkingWallet={checkingWallet}
            handleSetCheckingWallet={props.handleSetCheckingWallet}
            appName="Terrasacha"
            poweredby={true}
          />
        ) : (
          checkingWallet !== 'checking' && <RedirectToHome poweredby={false} appName={'Terrasacha'} checkingWallet={checkingWallet}/>
        )}
      </div>
    </div>
  );
};

export default Login;
