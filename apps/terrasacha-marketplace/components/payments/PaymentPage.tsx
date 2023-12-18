'use client';

import { BillingCard } from '../../components/payments/BillingCard';
import { BuyTokenCard } from '../../components/payments/BuyTokenCard';
import { useState } from 'react';

export default function PaymentPage({}) {
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const handleSetTokenAmount = async (value: string) => {
    setValidationError('');
    setTokenAmount(value);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <BuyTokenCard
        tokenAmount={tokenAmount}
        handleSetTokenAmount={handleSetTokenAmount}
        validationError={validationError}
      ></BuyTokenCard>
      <BillingCard
        tokenAmount={tokenAmount}
        setValidationError={setValidationError}
      ></BillingCard>
    </div>
  );
}
