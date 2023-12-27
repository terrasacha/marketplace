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
        <div className=" w-2/5 flex-col justify-center text-white hidden 2xl:flex">
          <h1 className="text-7xl tracking-wide font-normal pb-1">
            Aceleramos la{' '}
          </h1>
          <h1 className="text-7xl tracking-wide font-normal pb-1">
            transición hacia{' '}
          </h1>
          <h1 className="text-7xl tracking-wide font-normal pb-1">mundo de</h1>
          <h1 className="text-7xl tracking-wide font-normal pb-1">
            carbono neutral
          </h1>
          <p className="text-2xl tracking-normal pt-20">
            Somos un motor alternativo Para facilitar el desarrollo financiación
            e implementación de proyectos de mitigaci6n de cambio climåtico
          </p>
        </div>
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
