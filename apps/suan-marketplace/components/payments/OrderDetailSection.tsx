"use client";

import { Card } from "flowbite-react";

export function OrderDetailSection({
  tokenName,
  tokenCurrency,
  tokenPrice,
  amount,
  subTotalUSD,
  subTotalADA,
  feesUSD,
  feesADA,
  totalUSD,
  totalADA,
  exchangeRate,
  selectedMethod
}: {
  tokenName: string;
  tokenCurrency: string;
  tokenPrice: number;
  amount: string;
  subTotalUSD: number;
  subTotalADA: number;
  feesUSD: number;
  feesADA: number,
  totalUSD: number;
  totalADA: number;
  exchangeRate: number;
  selectedMethod: string | null,
}) {

  return (
    <div>
      <Card className="bg-green-400">
        <div className="text-white">
          <div className="flex justify-between">
            <span>Token que recibes</span>
            <span>{tokenName}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio</span>
            <span>{tokenPrice || 0} {tokenCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span>Cantidad</span>
            <span>{amount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {subTotalUSD || 0} {tokenCurrency} {selectedMethod === "Cardano" && "≈ " + (subTotalADA || 0) + " ADAs"}
            </span>
          </div>
          {
            selectedMethod === "Cardano" && (
              <div className="flex justify-between">
                <span>Network Fees</span>
                <span>{feesUSD || 0} {tokenCurrency} ≈ {feesADA || 0} ADAs</span>
              </div>
            )
          }
          {
            selectedMethod === "CC" && (
              <div className="flex justify-between">
                <span>Fees</span>
                <span>{feesUSD || 0} {tokenCurrency}</span>
              </div>
            )
          }
          <hr className="mt-5" />
          <div className="flex justify-between items-center">
            <span className="text-2xl">Total</span>
            <span className="font-bold">
              {!selectedMethod ? subTotalUSD || 0: totalUSD || 0} {tokenCurrency} {selectedMethod === "Cardano" && "≈ " + (totalADA || 0) + " ADAs"}
            </span>
          </div>
        </div>
      </Card>
      {exchangeRate && (
        <div className="text-right">
          <span className="text-xs text-right">
            1 ADAs ≈ {exchangeRate} {tokenCurrency}
          </span>
        </div>
      )}
    </div>
  );
}
