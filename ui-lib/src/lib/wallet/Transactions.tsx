import { useState } from 'react';
import { Card, NewTransactionModal } from '../ui-lib';

export default function Transactions(props: any) {

  return (
    <Card className="col-span-2 h-fit">
      <Card.Header title="Transacciones" tooltip={<NewTransactionModal />} />
      <Card.Body>
        <div className="flex items-center justify-center h-96">
          Aún no has realizado transacciones
        </div>
      </Card.Body>
    </Card>
  );
}
