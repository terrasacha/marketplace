import { useState } from 'react';
import { Card } from '../ui-lib';

export default function TradeCard(props: any) {

  return (
    <Card className="col-span-2 h-fit">
      <Card.Body>
        <div className="flex items-center justify-center h-96">
          No hay tokens para la compra
        </div>
      </Card.Body>
    </Card>
  );
}
