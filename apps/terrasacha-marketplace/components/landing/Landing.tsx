import LoadingPage from '@marketplaces/ui-lib/src/lib/common/LoadingPage';
import WelcomeCard2 from '@marketplaces/ui-lib/src/lib/landing/WelcomeCard2';
import EnableMFA from '@marketplaces/ui-lib/src/lib/auth/EnableMFA';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

const Login = (props: any) => {
  const { loading } = props;
  const [user, setUser] = useState<any>(null);
  const [setupMFA, setSetupMFA] = useState<boolean>(false);

  const toBoolean = useCallback((str: string): boolean => {
    return str === "true";
  }, []);

  const currentAuthenticatedUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      const MFA = toBoolean(userAttributes['custom:setMFA'] || '');
      
      if (!MFA) {
        setSetupMFA(true);
      }
      
      setUser(currentUser);
    } catch (err) {
      console.error('Error al obtener usuario autenticado:', err);
    }
  }, [toBoolean]);

  useEffect(() => {
    currentAuthenticatedUser();
  }, [currentAuthenticatedUser]);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedOut':
          setUser(null);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return (
<div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center">
  <div className="absolute inset-0 z-0">
    <Image
      priority={true}
              src="/v2/bg3.png"
      alt="landing-suan-image"
      layout="fill"
      objectFit="cover"
      objectPosition="center"
      className="z-0"
    />
  </div>
      <div className="font-jostItalic h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        {loading ? (
          <LoadingPage message="Consultando la información del usuario" />
        ) : setupMFA ? (
          <EnableMFA />
        ) : (
          <WelcomeCard2
            appName="Terrasacha"
            poweredby={true}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
