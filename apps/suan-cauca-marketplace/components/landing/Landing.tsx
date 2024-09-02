import LoadingPage from '@marketplaces/ui-lib/src/lib/common/LoadingPage';
import RedirectToHome from '@marketplaces/ui-lib/src/lib/landing/RedirectToHome';
import WelcomeCard from '@marketplaces/ui-lib/src/lib/landing/WelcomeCard';
import EnableMFA from '@marketplaces/ui-lib/src/lib/auth/EnableMFA';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
const Login = (props: any) => {
  const { loading, walletcount, checkingWallet, walletData } = props;
  const [user, setUser] = useState<any>(null);
  const [setupMFA, setSetupMFA] = useState(false)
  useEffect(() => {
    currentAuthenticatedUser();
  }, []);
  const toBoolean = (str: string) => {
    return str === "true";
  }
  async function currentAuthenticatedUser() {
    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes()
      const MFA = toBoolean(userAttributes['custom:setMFA'] || '')
      if(!MFA){
        setSetupMFA(true)
      }
      setUser(user);
      
    } catch (err) {
      console.log(err);
    } finally {
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
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        {loading ? (
          <LoadingPage message="Consultando información del usuario" />
        ) : 
        setupMFA ? 
        <EnableMFA />
        :
        walletcount === 0 ? (
          <WelcomeCard
            checkingWallet={checkingWallet}
            handleSetCheckingWallet={props.handleSetCheckingWallet}
            appName="Suan"
            poweredby={false}
          />
        ) : (
          checkingWallet !== 'checking' && (
            <RedirectToHome
              width_image={90}
              image={'/images/home-page/suan_logo.png'}
              poweredby={false}
              appName={'Suan'}
              checkingWallet={checkingWallet}
              walletData={walletData}
              handleSetCheckingWallet={props.handleSetCheckingWallet}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Login;
