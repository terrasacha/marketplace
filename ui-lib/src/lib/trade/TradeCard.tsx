import { useState } from 'react';
import { Card, CreateOrderCard, OrderBookCard } from '../ui-lib';

export default function TradeCard(props: any) {
  const [activeTab, setActiveTab] = useState<string>('my_orders');

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-3 xl:col-span-1">
        <CreateOrderCard />
      </div>
      <div className="col-span-3 xl:col-span-2">
        <OrderBookCard />
      </div>
      <div className="col-span-3">
        <Card>
          <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px">
              <li className="me-2">
                <a
                  href="#"
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'my_orders'
                      ? 'text-blue-600 border-blue-600'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                  onClick={() => handleSetActiveTab('my_orders')}
                >
                  Mis Ordenes
                </a>
              </li>
              <li className="me-2">
                <a
                  href="#"
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'my_orders_history'
                      ? 'text-blue-600 border-blue-600'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                  aria-current="page"
                  onClick={() => handleSetActiveTab('my_orders_history')}
                >
                  Historial de ordenes
                </a>
              </li>
            </ul>
          </div>
          <Card.Body>
            {activeTab === 'my_orders' && (
              <div className="h-96 flex justify-center items-center">
                No tienes ordenes activas
              </div>
            )}
            {activeTab === 'my_orders_history' && (
              <div className="h-96 flex justify-center items-center">
                Aún no has realizado ordenes
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
