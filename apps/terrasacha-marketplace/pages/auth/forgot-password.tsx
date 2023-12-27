import { MyPage } from '../../components/common/types';
import { ConfirmPassword } from '@marketplaces/ui-lib';
import {
  forgotPassword,
  forgotPasswordSubmit,
} from 'apps/terrasacha-marketplace/backend';
const ForgotPasswd = (props: any) => {
  return (
    <div
      className="w-full h-screen flex justify-center items-center bg-slate-200"
      style={{
        backgroundImage: `url(/images/home-page/fondo_login.jpg)`,
        backgroundPosition: 'center',
      }}
    >
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center">
        <ConfirmPassword
          forgotPasswordSubmit={forgotPasswordSubmit}
          forgotPassword={forgotPassword}
          appName="Terrasacha"
          widthLogo={250}
          heightLogo={20}
          logo="/images/home-page/terrasacha_logo_principal.png"
        />
      </div>
    </div>
  );
};

export default ForgotPasswd;
ForgotPasswd.Layout = 'NoLayout';
