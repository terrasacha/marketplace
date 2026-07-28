import { signInAuth } from '@terrasacha/backend';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import LoginForm from '@marketplaces/ui-lib/src/lib/auth/LoginForm';

const Login = () => {
  return (
    <div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/v2/bg3.png')" }}
        aria-hidden="true"
      />

      <div className="relative h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />
        <LoginForm
          logo="/v2/logoterrasacha.svg"
          widthLogo={400}
          heightLogo={80}
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
