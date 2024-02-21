import { useState } from 'react';
import { Card, CreateOrderCard, SearchIcon } from '../ui-lib';

export default function OrderBookCard(props: any) {
  return (
    <Card>
      <Card.Header
        title="Libro de ordenes"
        tooltip={
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              id="adas"
              type="text"
              aria-invalid="false"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
              autoComplete="off"
              placeholder="Busca un activo"
              required
            />
          </div>
        }
      />
      <Card.Body>
        <div>
          <div className="flex space-x-2 items-center px-3 py-2">
            <div className="w-full text-center">Activo</div>
            <div className="w-full text-center">Cantidad</div>
            <div className="w-full text-center">Precio (ADA)</div>
            <div className="w-full text-center">Total</div>
            <div className="w-full text-center"></div>
          </div>
          <div className="space-y-1">
            <div className="flex space-x-2 items-center bg-custom-dark text-white rounded-lg px-3 py-2">
              <div className="w-full text-center">
                <p>SUAN-243637095</p>
              </div>
              <div className="w-full text-center">
                <p>5</p>
              </div>
              <div className="w-full text-center">
                <p>t₳ 120</p>
              </div>
              <div className="w-full text-center">
                <p>600</p>
              </div>
              <div className="w-full text-center">
                <button
                  type="button"
                  className="text-yellow-300 hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5 "
                >
                  Comprar
                </button>
              </div>
            </div>
            <div className="flex space-x-2 items-center bg-custom-dark text-white rounded-lg px-3 py-2">
              <div className="w-full text-center">
                <p>SUAN-243637095</p>
              </div>
              <div className="w-full text-center">
                <p>5</p>
              </div>
              <div className="w-full text-center">
                <p>t₳ 120</p>
              </div>
              <div className="w-full text-center">
                <p>600</p>
              </div>
              <div className="w-full text-center">
                <button
                  type="button"
                  className="text-yellow-300 hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5 "
                >
                  Comprar
                </button>
              </div>
            </div>
            <div className="flex space-x-2 items-center bg-custom-dark text-white rounded-lg px-3 py-2">
              <div className="w-full text-center">
                <p>SUAN-243637095</p>
              </div>
              <div className="w-full text-center">
                <p>5</p>
              </div>
              <div className="w-full text-center">
                <p>t₳ 120</p>
              </div>
              <div className="w-full text-center">
                <p>600</p>
              </div>
              <div className="w-full text-center">
                <button
                  type="button"
                  className="text-yellow-300 hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5 "
                >
                  Comprar
                </button>
              </div>
            </div>
            <div className="flex space-x-2 items-center bg-custom-dark text-white rounded-lg px-3 py-2">
              <div className="w-full text-center">
                <p>SUAN-243637095</p>
              </div>
              <div className="w-full text-center">
                <p>5</p>
              </div>
              <div className="w-full text-center">
                <p>t₳ 120</p>
              </div>
              <div className="w-full text-center">
                <p>600</p>
              </div>
              <div className="w-full text-center">
                <button
                  type="button"
                  className="text-yellow-300 hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5 "
                >
                  Comprar
                </button>
              </div>
            </div>
            <div className="flex space-x-2 items-center bg-custom-dark text-white rounded-lg px-3 py-2">
              <div className="w-full text-center">
                <p>SUAN-243637095</p>
              </div>
              <div className="w-full text-center">
                <p>5</p>
              </div>
              <div className="w-full text-center">
                <p>t₳ 120</p>
              </div>
              <div className="w-full text-center">
                <p>600</p>
              </div>
              <div className="w-full text-center">
                <button
                  type="button"
                  className="text-yellow-300 hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5 "
                >
                  Comprar
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-5">
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Mostrando de{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                0
              </span>{' '}
              a{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                0
              </span>{' '}
              de un total de{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                0
              </span>{' '}
              Activos
            </span>
            <div className="inline-flex mt-2 xs:mt-0">
              <button
                className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark rounded-s hover:bg-custom-dark-hover
            `}
                disabled
              >
                <svg
                  className="w-3.5 h-3.5 me-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5H1m0 0 4 4M1 5l4-4"
                  />
                </svg>
                Prev
              </button>
              <button
                className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark border-0 border-s border-gray-700 rounded-e hover:bg-custom-dark-hover '
            }`}
                disabled
              >
                Next
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
