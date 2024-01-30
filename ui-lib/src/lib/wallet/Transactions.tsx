import { useState } from 'react';
import { Card } from '../ui-lib';

export default function Transactions(props: any) {

  return (
    <Card className="col-span-2 h-fit">
      <Card.Header title="Transacciones" />
      <Card.Body>
        <div className="flex items-center justify-center h-96">
          Aún no has realizado transacciones
        </div>
      </Card.Body>
    </Card>
  );
}
