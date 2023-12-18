"use client";

import { CreditCardIcon } from "../icons/CreditCardIcon";
import { CardanoIcon } from "../icons/CardanoIcon";
import SelectWalletModal from "../modals/SelectWalletModal";

export function SelectPaymentMethodSection({
  handleClickPaymentMethod,
  openModal,
  selectedMethod,
  setOpenModal
}: {
  handleClickPaymentMethod: (data: string) => void;
  setOpenModal: (data: string) => void;
  openModal: string | undefined;
  selectedMethod: string | null;
}) {
  const selectedOptionStyle =
    "bg-gray-400 text-white outline-dashed ring-4 ring-gray-300";

  return (
    <>
      <div className="flex w-full gap-x-2">
        <div className="flex-1 text-center">
          <a
            href="#"
            onClick={() => handleClickPaymentMethod("CC")}
            className={`${
              selectedMethod === "CC" && selectedOptionStyle
            } block rounded-lg bg-gray-200 py-2.5 text-gray-500`}
          >
            <CreditCardIcon className="mx-auto h-7 w-7 mb-1" />
            <span className="font-sans text-sm font-semibold">Tarjeta</span>
          </a>
        </div>
        <div className="flex-1 text-center">
          <a
            href="#"
            onClick={() => handleClickPaymentMethod("Cardano")}
            className={`${
              selectedMethod === "Cardano" && selectedOptionStyle
            } block rounded-lg bg-gray-200 py-2.5 text-gray-500`}
          >
            <CardanoIcon className="mx-auto h-7 w-7 mb-1" />
            <span className="font-sans text-sm font-semibold">Cardano</span>
          </a>
        </div>
      </div>
      <SelectWalletModal openModal={openModal} setOpenModal={setOpenModal}/>
    </>
  );
}
