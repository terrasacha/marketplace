import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SignUpForm from '@marketplaces/ui-lib/src/lib/auth/SignUpForm';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import { signUpAuth } from '@cauca/backend';
import { MyPage } from '@cauca/components/common/types';
import Image from 'next/image';

const Signup: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center">

      <div className="absolute inset-0 z-0">
      <Image
        priority={true}
        src="/images/home-page/fondo_signup.avif"
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
          logo="/images/home-page/suan_logo.png"
          widthLogo={60}
          heightLogo={60}
          appName="Suan"
          signUpAuth={signUpAuth}
          poweredby={false}
        />
      </div>
    </div>
  );
};

export default Signup;
Signup.Layout = 'NoLayout';
