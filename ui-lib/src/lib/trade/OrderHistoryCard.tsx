import { useContext, useEffect, useState } from 'react';
import Card from '../common/Card';

export default function TradeCard(props: any) {

  const [activeTab, setActiveTab] = useState<string>('my_orders');

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
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
  );
}
