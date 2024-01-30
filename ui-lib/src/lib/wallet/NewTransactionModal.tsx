import { useState } from 'react';
import { Card, Modal, PlusIcon, TrashIcon } from '../ui-lib';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewTransactionModal(props: any) {
  const [openModal, setOpenModal] = useState(false);
  const newTransactionGroupInitialState = [
    { checked: false, token: '', walletAddress: '', amount: '', label: '' },
  ];
  const [newTransactionGroup, setNewTransactionGroup] = useState(
    newTransactionGroupInitialState
  );

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

  const addNewTransaction = () => {
    console.log(newTransactionGroup);
    setNewTransactionGroup([
      ...newTransactionGroup,
      { checked: false, token: '', walletAddress: '', amount: '', label: '' },
    ]);
  };

  const removeCheckedTransactions = () => {
    const filteredTransactions = newTransactionGroup.filter(
      (transaction) => !transaction.checked
    );
    const checkedTransactions = newTransactionGroup.filter(
      (transaction) => transaction.checked
    );
    if (checkedTransactions.length === 0) {
      toast.warning('Debes seleccionar almenos una fila');
      return;
    }
    if (filteredTransactions.length === 0) {
      toast.warning('No puedes eliminar todas las filas');
      return;
    }
    setNewTransactionGroup(filteredTransactions);
  };

  return (
    <>
      <Link
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        href={'/wallet/send'}
      >
        Nueva transacción
      </Link>
      <Modal show={openModal} size="6xl">
        <Modal.Header
          onClose={() => {
            setOpenModal(false);
            setNewTransactionGroup(newTransactionGroupInitialState);
          }}
        >
          Nueva transacción
        </Modal.Header>
        <Modal.Body>
          <div className="flex justify-end">
            {/* <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 p-3">
              <input
                id="bordered-checkbox-1"
                type="checkbox"
                value=""
                name="bordered-checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div> */}
            <button
              type="button"
              className="text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2"
              onClick={removeCheckedTransactions}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          {newTransactionGroup.map((transaction: any, index: number) => {
            return (
              <div className="flex space-x-2" key={index}>
                <div className="flex w-auto items-center border border-gray-200 rounded dark:border-gray-700 p-3">
                  <input
                    id={`bordered-checkbox-${index}-${Math.floor(
                      Math.random() * 1000000
                    )}`}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    checked={transaction.checked}
                    onChange={(e) =>
                      handleInputChange(index, 'checked', e.target.checked)
                    }
                  />
                </div>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={transaction.token}
                  onChange={(e) =>
                    handleInputChange(index, 'token', e.target.value)
                  }
                >
                  <option value="">Token</option>
                  <option value="1">Token 1</option>
                  <option value="2">Token 2</option>
                  <option value="3">Token 3</option>
                </select>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Wallet Address"
                  required
                  value={transaction.walletAddress}
                  onChange={(e) =>
                    handleInputChange(index, 'walletAddress', e.target.value)
                  }
                />
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Amount"
                  required
                  value={transaction.amount}
                  onChange={(e) =>
                    handleInputChange(index, 'amount', e.target.value)
                  }
                />
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Label"
                  required
                  value={transaction.label}
                  onChange={(e) =>
                    handleInputChange(index, 'label', e.target.value)
                  }
                />
              </div>
            );
          })}
          <div className="flex justify-between">
            <button
              type="button"
              className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2"
              onClick={addNewTransaction}
            >
              Enviar
            </button>
            <button
              type="button"
              className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2"
              onClick={addNewTransaction}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
