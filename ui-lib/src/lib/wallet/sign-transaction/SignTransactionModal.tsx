import { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import SignTransaction from './SignTransaction';
import TransactionInfoCard from './TransactionInfoCard';

interface SignTransactionModalProps {
  handleOpenSignTransactionModal: (signStatus?: boolean) => void;
  signTransactionModal: boolean;
  newTransactionBuild: any;
  signType: string;
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
    signType,
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
              pendingTx={newTransactionBuild}
              signType={signType}
            />
            <TransactionInfoCard
              title={newTransactionBuild.title}
              subtitle={newTransactionBuild.subtitle}
              tx_id={newTransactionBuild.tx_id}
              tx_type={newTransactionBuild.tx_type}
              tx_fee={newTransactionBuild.tx_fee}
              tx_value={newTransactionBuild.tx_value}
              tx_assets={newTransactionBuild.tx_assets}
              block={newTransactionBuild.block}
              tx_size={newTransactionBuild.tx_size}
              inputUTxOs={newTransactionBuild.inputUTxOs}
              outputUTxOs={newTransactionBuild.outputUTxOs}
              is_collapsed={false}
              metadata={newTransactionBuild.metadata}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
