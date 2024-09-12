import '@terrasacha/styles/globals.css';
/* import { MeshProvider } from '@meshsdk/react'; */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextNProgress from 'nextjs-progressbar';
import { WalletContextProvider } from '@marketplaces/utils-2';
import { NotificationContextProvider } from '@terrasacha/store/notification-context';
import { ProjectInfoContextProvider } from '@terrasacha/store/projectinfo-context';
import { LoginFromContextProvider } from '@terrasacha/store/login-from';
import '../styles/globals.css';
import { Toaster } from 'sonner';
import { MyAppProps } from '@terrasacha/components/common/types';
import { Layouts } from '@terrasacha/components/common/Layouts';
import TelegramFloatingButton from '@terrasacha/components/TelegramFloatingButton';
import { Amplify } from 'aws-amplify';

import config from '../../../src/aws-exports';

Amplify.configure(config);

function MyApp({ Component, pageProps }: MyAppProps) {
  const Layout = Layouts[Component.Layout] ?? ((page) => page);
  const router = useRouter();

  useEffect(() => {}, [router.pathname]);

  return (
    <>
      <Head>
        <title>Terrasacha marketplace</title>
        <meta
          name="description"
          content="Cuadro de mando de Inversionista en Terrasacha"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoginFromContextProvider>
        <NotificationContextProvider>
          <WalletContextProvider>
            <ProjectInfoContextProvider>
              <div>
                <NextNProgress
                  color="#69A1B3"
                  startPosition={0.3}
                  stopDelayMs={200}
                  height={1}
                  showOnShallow={true}
                  options={{ easing: 'ease', speed: 500 }}
                />
                <Layout>
                  <Component {...pageProps} />
                  <TelegramFloatingButton></TelegramFloatingButton>
                </Layout>
                <Toaster richColors></Toaster>
              </div>
            </ProjectInfoContextProvider>
          </WalletContextProvider>
        </NotificationContextProvider>
      </LoginFromContextProvider>
    </>
  );
}
export default MyApp;
