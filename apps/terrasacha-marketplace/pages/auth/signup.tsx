import React, { useState, useEffect } from 'react';
import ConfirmPassword from '../../components/auth/ConfirmPassword';
import { MyPage } from '../../components/common/types';
import { signUpAuth } from '../../backend';
import { SignUpForm, Title } from '@marketplaces/ui-lib';
const Signup: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div
      className="w-full h-screen flex justify-center items-center bg-slate-200"
      style={{
        backgroundImage: `url(/images/home-page/fondo_signup.jpg)`,
        backgroundPosition: 'center',
      }}
    >
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between">
        <Title />
        <SignUpForm
          handleSetSignUpStatus={handleSetSignUpStatus}
          logo="/images/home-page/terrasacha_logo_principal.png"
          widthLogo={250}
          heightLogo={20}
          signUpAuth={signUpAuth}
          appName="Terrasacha"
        />
      </div>
    </div>
  );
};

export default Signup;
Signup.Layout = 'NoLayout';
