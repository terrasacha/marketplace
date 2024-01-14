"use client";

import { Card } from "flowbite-react";

export function TokenDetailSection({
  projectName,
  tokenName,
  tokenCurrency,
  creationDate,
  availableAmount,
  tokenPrice,
}: {
  projectName: string;
  tokenName: string;
  tokenCurrency: string;
  creationDate: string;
  availableAmount: string;
  tokenPrice: string;
}) {
  return (
    <div>
      <span className="text-2xl">Comprar Tokens</span>
      <Card className="border-2 border-dotted mt-4">
        <div className="text-gray-700">
          <div className="flex justify-between">
            <span>Proyecto</span>
            <span className="font-bold">{projectName}</span>
          </div>
          <div className="flex justify-between">
            <span>Nombre del token</span>
            <span>{tokenName}</span>
          </div>
          <div className="flex justify-between">
            <span>Cantidad disponible</span>
            <span>{parseFloat(availableAmount).toLocaleString("es-CO")} Tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Precio unitario</span>
            <span className="font-bold">{parseFloat(tokenPrice).toLocaleString("es-CO")} {tokenCurrency} / tCO2eq</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha de creación</span>
            <span>{creationDate}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
