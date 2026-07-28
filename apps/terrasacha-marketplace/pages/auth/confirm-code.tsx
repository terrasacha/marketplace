import React, { useState } from 'react';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import ConfirmCode from '@marketplaces/ui-lib/src/lib/auth/ConfirmationCode';
import { confirmSignUpAuth, handleResendCode } from '@terrasacha/backend';
import { MyPage } from '@terrasacha/components/common/types';

const ConfirmCodePage: MyPage = () => {
  return (
    <div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/v2/bg3.png')" }}
        aria-hidden="true"
      />

      <div className="relative h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />

        <ConfirmCode
          logo="/v2/logo.svg"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          confirmSignUpAuth={confirmSignUpAuth}
          handleResendCode={handleResendCode}
        />
      </div>
    </div>
  );
};

export default ConfirmCodePage;
ConfirmCodePage.Layout = 'NoLayout';
