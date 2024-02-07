import { useEffect, useState } from 'react';
import {
  CopyIcon,
  LockIcon,
  Modal,
  SignTransaction,
  TransactionInfoCard,
} from '../../ui-lib';

interface SignTransactionModalProps {
  handleOpenSignTransactionModal: () => void;
  signTransactionModal: boolean;
  newTransactionBuild: any;
}

const SEARCH_TYPE = {
  ALL: 'all',
  FT: 'ft',
  NFT: 'nft',
};

export default function SignTransactionModal(props: SignTransactionModalProps) {
  const {
    handleOpenSignTransactionModal,
    signTransactionModal,
    newTransactionBuild,
  } = props;

  return (
    <>
      {newTransactionBuild && (
        <Modal show={signTransactionModal} size="6xl">
          <Modal.Header
            onClose={() => {
              handleOpenSignTransactionModal();
            }}
          >
            Firmar Transacción
          </Modal.Header>
          <Modal.Body>
            <SignTransaction
              handleOpenSignTransactionModal={handleOpenSignTransactionModal}
              cbor={newTransactionBuild.cbor}
            />
            <TransactionInfoCard
              title={newTransactionBuild.title}
              subtitle={newTransactionBuild.subtitle}
              tx_id={newTransactionBuild.tx_id}
              tx_type={newTransactionBuild.tx_type}
              tx_fee={newTransactionBuild.tx_fee}
              tx_value={newTransactionBuild.tx_value}
              block={newTransactionBuild.block}
              tx_size={newTransactionBuild.tx_size}
              inputUTxOs={newTransactionBuild.inputUTxOs}
              outputUTxOs={newTransactionBuild.outputUTxOs}
              is_collapsed={false}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
