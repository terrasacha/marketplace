import LoginForm from '../../components/auth/LogInForm';
import ConfirmPassword from '../../components/auth/ConfirmPassword';
import { MyPage } from '../../components/common/types';

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
        <ConfirmPassword />
      </div>
    </div>
  );
};

export default ForgotPasswd;
ForgotPasswd.Layout = 'NoLayout';
