import dynamic from 'next/dynamic';
import { signInAuth } from '@terrasacha/backend';
import Image from 'next/image';
import { LoginForm, Title } from '@marketplaces/ui-lib';
const Login = (props: any) => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.avif"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />
        <LoginForm
          logo="/images/home-page/terrasacha_logo_principal.png"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          signInAuth={signInAuth}
          poweredby={true}
        />
      </div>
    </div>
  );
};

export default Login;
Login.Layout = 'NoLayout';
