/* import LoginForm from '../../components/auth/LogInForm'; */
import { MyPage } from '../../components/common/types';
import { LoginForm, Title } from '@marketplaces/ui-lib';
import { signInAuth } from '../../backend';
const Login = (props: any) => {
  return (
    <div
      className="w-full h-screen flex justify-center items-center bg-slate-200"
      style={{
        backgroundImage: `url(/images/home-page/fondo_login.jpg)`,
        backgroundPosition: 'center',
      }}
    >
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between">
        <Title />
        <LoginForm
          signInAuth={signInAuth}
          appName="Terrasacha"
          logo="/images/home-page/terrasacha_logo_principal.png"
          widthLogo={250}
          heightLogo={20}
        />
      </div>
    </div>
  );
};

export default Login;
Login.Layout = 'NoLayout';
