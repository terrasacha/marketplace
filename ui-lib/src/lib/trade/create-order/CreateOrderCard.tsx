import { useState } from 'react';
import { Card, OrderBookCard } from '../../ui-lib';

export default function CreateOrderCard(props: any) {
  return (
    <Card>
      <div className="flex justify-center bg-custom-dark py-6">
        <p className="text-white text-2xl font-semibold">
          Crear orden de venta
        </p>
      </div>
      <Card.Body>
        {/* Orden */}
        <div className="flex-col space-y-2">
          <div>
            <label htmlFor="countries" className="block mb-2 text-gray-900">
              Yo quiero vender
            </label>
            <select
              id="countries"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected>Escoge un activo</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
            </select>
          </div>
          <div>
            <label htmlFor="countries" className="block mb-2 text-gray-900">
              Cantidad
            </label>
            <input
              id="adas"
              type="text"
              aria-invalid="false"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  "
              autoComplete="off"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label htmlFor="countries" className="block mb-2 text-gray-900">
              Por un valor de
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                t₳
              </div>
              <input
                id="adas"
                type="text"
                aria-invalid="false"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
                autoComplete="off"
                placeholder="0.000000"
                required
              />
            </div>
          </div>
          {/* Resumen de orden */}
          <div className="flex-col pt-10">
            <div className="flex justify-between mb-2">
              <p>Total Fee</p>
              <p>2 %</p>
            </div>
            <div className="flex justify-between text-xs">
              <p>Fee Transacción</p>
              <p>2 %</p>
            </div>
            <div className="flex justify-between text-xs">
              <p>Fee SUAN</p>
              <p>2 %</p>
            </div>
          </div>

          <button
            type="button"
            className="flex justify-center w-full text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-semibold rounded text-lg px-3 py-3"
          >
            Vender
          </button>
        </div>
      </Card.Body>
    </Card>
  );
}
