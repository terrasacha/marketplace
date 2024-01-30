import React, { useState } from 'react';
import {
  Assets,
  Card,
  Modal,
  PencilIcon,
  Recipient,
  SelectTokensModal,
  TrashIcon,
} from '../ui-lib';
import { toast } from 'sonner';
import { useWallet } from '@meshsdk/react';
// Definir el tipo de 'token'
interface AccountProps {
  userWalletData: any;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function WalletSend(props: AccountProps) {
  const { wallet, connected } = useWallet();

  const newTransactionGroupInitialState = [
    { walletAddress: '', adaAmount: '', checked: false, selectedAssets: [] },
  ];
  const [newTransactionGroup, setNewTransactionGroup] = useState(
    newTransactionGroupInitialState
  );
  const [transactionMessage, setTransactionMessage] = useState('');
  const [selectTokensModal, setSelectTokensModal] = useState({
    visible: false,
    data: [],
    recipientID: 0,
  });

  const handleOpenSelectTokensModal = (recipientID: number = 0) => {
    setSelectTokensModal((prevState) => ({
      ...prevState,
      visible: !selectTokensModal.visible,
      recipientID: recipientID,
    }));
  };

  const handleSetSelectedTokensToSelectTokensModal = (
    selectedTokensData: any
  ) => {
    setSelectTokensModal((prevState) => ({
      ...prevState,
      data: selectedTokensData,
    }));
  };

  const handleAddRecipientSelectedAssets = (index: number, data: any) => {
    const updatedTransactions = [...newTransactionGroup];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      selectedAssets: data,
    };
    setNewTransactionGroup(updatedTransactions);
  };

  const handleInputChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedTransactions = [...newTransactionGroup];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: value,
    };
    setNewTransactionGroup(updatedTransactions);
  };

  const handleAddRecipient = () => {
    setNewTransactionGroup([
      ...newTransactionGroup,
      { walletAddress: '', adaAmount: '', checked: false, selectedAssets: [] },
    ]);
  };

  const handleRemoveRecipient = (index: number) => {
    const filteredTransactions = newTransactionGroup.filter(
      (_, idx) => idx !== index
    );
    setNewTransactionGroup(filteredTransactions);
  };

  const handleSendTransaction = async () => {
    let userWalletAddress;

    if (connected) {
      userWalletAddress = await wallet.getChangeAddress();
    } else {
      userWalletAddress =
        'addr_test1qr29hvdltfdsfls6vq0yfxvyh59c2yrjjrl65ug746hy3xw5twcm7kjmqnlp5cq7gjvcf0gts5g89y8l4fc3at4wfzvsdycqzt';
    }
    const addresses = newTransactionGroup.map((recipient) => {
      return {
        address: recipient.walletAddress,
        lovelace: parseFloat(recipient.adaAmount) * 1000000,
      };
    });

    let payload = {
      wallet_id: userWalletAddress,
      addresses: addresses,
      metadata: {
        message: transactionMessage,
      },
    };

    console.log('Recipientes: ', newTransactionGroup);
    console.log('Envio de transacción: ', payload);

    // const response = await fetch('/api/transactions/build-tx', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload),
    // });
    // const buildTxResponse = await response.json();

    // console.log(buildTxResponse);

    // const signed = {
    //   wallet_id: userWalletAddress,
    //   cbor: buildTxResponse.,
    // };

    // const response = await fetch('/api/transactions/sign-submit', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(signed),
    // });
    // const signSubmitResponse = await response.json();

    //console.log(signSubmitResponse);
  };

  console.log(props.userWalletData);
  return (
    <>
      <div className="grid grid-cols-6 gap-5">
        <Card className="col-span-6 xl:col-span-6 h-fit">
          <Card.Header title="Nueva Transacción" />
          <Card.Body className="space-y-4">
            {newTransactionGroup.map((transaction: any, index: number) => {
              return (
                <Recipient
                  key={index}
                  index={index}
                  walletAddress={transaction.walletAddress}
                  adaAmount={transaction.adaAmount}
                  selectedAssets={transaction.selectedAssets}
                  handleInputChange={handleInputChange}
                  handleRemoveRecipient={handleRemoveRecipient}
                  handleOpenSelectTokensModal={handleOpenSelectTokensModal}
                  handleSetSelectedTokensToSelectTokensModal={
                    handleSetSelectedTokensToSelectTokensModal
                  }
                  canDelete={newTransactionGroup.length > 1 ? true : false}
                />
              );
            })}
            {/* Add On message */}
            <div className=" border-gray-800 border-t border-b flex-col py-4 space-y-1">
              <p className="text-xl font-semibold">Add On-Chain Message</p>
              <p>
                Add an (optional) message/comment/memo to the transaction. Press
                'ENTER' for multi-line message.
              </p>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                  <PencilIcon className="w-5 h-5" />
                </div>
                <textarea
                  id="message"
                  rows={1}
                  className="block col-span-4 ps-10 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="Ingresa tú mensaje"
                  value={transactionMessage}
                  onChange={(e) => setTransactionMessage(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
            {/* Footer */}
            <div className="flex justify-between">
              <button
                type="button"
                className="col-span-4 sm:col-span-1 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
                onClick={handleAddRecipient}
              >
                Añadir destinatario
              </button>
              <button
                type="button"
                className="col-span-4 sm:col-span-1 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 "
                onClick={handleSendTransaction}
              >
                Enviar
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <SelectTokensModal
        selectTokensModal={selectTokensModal}
        handleOpenSelectTokensModal={handleOpenSelectTokensModal}
        handleSetSelectedTokensToSelectTokensModal={
          handleSetSelectedTokensToSelectTokensModal
        }
        handleAddRecipientSelectedAssets={handleAddRecipientSelectedAssets}
      />
    </>
  );
}
