import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SignUpForm } from '@marketplaces/ui-lib';
import { signUpAuth } from '@suan/backend';
import Title from '@suan/components/auth/Title';
import { MyPage } from '@suan/components/common/types';
import Image from 'next/image';

const Signup: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_signup.avif"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
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
