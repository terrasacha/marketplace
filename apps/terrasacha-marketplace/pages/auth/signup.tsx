import React, { useState } from 'react';
import SignUpForm from '@marketplaces/ui-lib/src/lib/auth/SignUpForm';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import { signUpAuth } from '@terrasacha/backend';
import { MyPage } from '@terrasacha/components/common/types';

const Signup: MyPage = () => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div className="relative w-full min-h-screen flex justify-center items-center bg-slate-200 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/v2/bg2.png')" }}
        aria-hidden="true"
      />
      <div className="relative h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />
        <SignUpForm
          handleSetSignUpStatus={handleSetSignUpStatus}
          logo="/v2/logo.svg"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          signUpAuth={signUpAuth}
          poweredby={true}
        />
      </div>
    </div>
  );
};

export default Signup;
Signup.Layout = 'NoLayout';
