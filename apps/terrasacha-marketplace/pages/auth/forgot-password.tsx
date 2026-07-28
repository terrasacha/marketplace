import ConfirmPassword from '@marketplaces/ui-lib/src/lib/auth/ConfirmPassword';
import { forgotPasswordSubmit, forgotPassword } from '@terrasacha/backend';

const ForgotPasswd = () => {
  return (
    <div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/v2/bg3.png')" }}
        aria-hidden="true"
      />

      <div className="relative h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        <ConfirmPassword
          logo="/v2/logo.svg"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          forgotPassword={forgotPassword}
          forgotPasswordSubmit={forgotPasswordSubmit}
        />
      </div>
    </div>
  );
};

export default ForgotPasswd;
ForgotPasswd.Layout = 'NoLayout';
