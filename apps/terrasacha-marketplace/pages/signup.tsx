import React, { useState, useEffect } from 'react';
import SignUpForm from '@marketplaces/ui-lib/src/lib/auth/SignUpForm';
import Title from '@marketplaces/ui-lib/src/lib/auth/Titlev2';
import { signUpAuth } from '@terrasacha/backend';
import { MyPage } from '@terrasacha/components/common/types';
import Image from 'next/image';

const Signup: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-slate-200">
      <div className="absolute inset-0 z-0">
      <Image
        priority={true}
            src="/v2/bg3.avif"
        alt="landing-suan-image"
        layout="fill"
      objectFit="cover"
      objectPosition="center"
      className="z-0"
      />
      </div>
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
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
