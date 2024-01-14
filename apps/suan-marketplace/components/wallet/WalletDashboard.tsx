import React, { useState } from 'react';
import Modal from '@suan//components/wallet/modal';
import dynamic from 'next/dynamic';

// Importar el componente Modal
const ProjectDataModal = dynamic(
  () => import('@suan//components/modals/ProjectDataModal')
);

// Definir el tipo de 'token'
interface Token {
  id: number;
  title: string;
  image: string;
  description: string;
  // Agrega cualquier otra propiedad que tenga tu token
}
const WalletDashboard = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sectionCount, setSectionCount] = useState(1); // Track the number of sections

  const tokensData = {
    yourTokens: [
      {
        id: 1,
        title: 'Token 1',
        image: 'url/to/token1.png',
        description: 'Descripción del Token 1',
      },
      {
        id: 2,
        title: 'Token 2',
        image: 'url/to/token2.png',
        description: 'Descripción del Token 2',
      },
      {
        id: 3,
        title: 'Token 3',
        image: 'url/to/token3.png',
        description: 'Descripción del Token 3',
      },
      {
        id: 1,
        title: 'Token 1',
        image: 'url/to/token1.png',
        description: 'Descripción del Token 1',
      },
    ],
    otherTokens: [
      {
        id: 4,
        title: 'Token 4',
        image: 'url/to/token4.png',
        description: 'Descripción del Token 4',
      },
      {
        id: 5,
        title: 'Token 5',
        image: 'url/to/token5.png',
        description: 'Descripción del Token 5',
      },
      {
        id: 6,
        title: 'Token 6',
        image: 'url/to/token6.png',
        description: 'Descripción del Token 6',
      },
      {
        id: 4,
        title: 'Token 4',
        image: 'url/to/token4.png',
        description: 'Descripción del Token 4',
      },
    ],
  };

  const openModal = (token: Token) => {
    if (token) {
      setSelectedToken(token);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedToken(null);
  };

  return (
    <div className="h-auto w-full px-5 pt-6">
      <div className="p-4 border-gray-200 rounded-lg dark:border-gray-700 mt-14">
        <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-gray-500">
          Tus Billetera
        </h2>
      </div>
      <div className="mb-4">
        <p className="text-xl">₳ 25.2365 </p>
        <p>$ 25 USD</p>
      </div>
      <div className="flex">
        <div className="w-1/2 pr-4">
          <h2 className="text-xl font-bold mb-2 azul">Tus Tokens</h2>
          <div className="flex">
            {tokensData.yourTokens.map((token) => (
              <div
                key={token.id}
                className="mb-4 cursor-pointer md:w-1/4 token-wallet m-3 w-1/2"
                onClick={() => openModal(token)}
              >
                <img
                  src={token.image}
                  alt={token.title}
                  className="w-full h-32 object-cover mb-2 m-auto d-block"
                />
                <p className="text-sm text-center p-4">{token.title}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 pl-4">
          <h2 className="text-xl font-bold mb-2">Otros Tokens</h2>
          <div className="flex">
            {tokensData.otherTokens.map((token) => (
              <div
                key={token.id}
                className="mb-4 cursor-pointer md:w-1/4 token-wallet m-3 w-1/2"
                onClick={() => openModal(token)}
              >
                <img
                  src={token.image}
                  alt={token.title}
                  className="w-full h-32 object-cover mb-2 m-auto d-block"
                />
                <p className="text-sm text-center p-4">{token.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isModalOpen && selectedToken !== null && (
        // Usar el componente Modal con los datos del token seleccionado
        <Modal token={selectedToken} closeModal={closeModal} />
      )}{' '}
      <div className="detail-tabs">
        <div className="detail-div border-[#ABABAB] flex justify-center">
          <div className="tabs mt-2 pt-2 flex md:flex-row  flex-col">
            {/* Tabs quemados directamente en el código */}
            <button
              className={`" m-2 border rounded-lg text-[#2E2F30] py-2 px-10 border-[#D9D9D9] hover:bg-[#1F0004] ${
                activeTab === 0
                  ? 'border-b-2 border-[#1F0004] text-[#FFF] bg-[#6C000D] font-bold'
                  : 'bg-[#D9D9D9] font-semibold border-b-2 border-transparent '
              }`}
              onClick={() => setActiveTab(0)}
            >
              Enviar
            </button>
            <button
              className={`" m-2 border rounded-lg text-[#2E2F30] py-2 px-10 border-[#D9D9D9] hover:bg-[#1F0004] ${
                activeTab === 1
                  ? 'border-b-2 border-[#1F0004] text-[#FFF] bg-[#6C000D] font-bold'
                  : 'bg-[#D9D9D9] font-semibold border-b-2 border-transparent '
              }`}
              onClick={() => setActiveTab(1)}
            >
              Recibir
            </button>
            <button
              className={`" m-2 border rounded-lg text-[#2E2F30] py-2 px-10 border-[#D9D9D9] hover:bg-[#1F0004] ${
                activeTab === 2
                  ? 'border-b-2 border-[#1F0004] text-[#FFF] bg-[#6C000D] font-bold'
                  : 'bg-[#D9D9D9] font-semibold border-b-2 border-transparent '
              }`}
              onClick={() => setActiveTab(2)}
            >
              Historial
            </button>
          </div>
        </div>
        <div className="tab-component mt-4 p-8 rounded-lg bg-[#FFF]">
          {/* Contenido específico para cada pestaña */}
          {activeTab === 0 && (
            <div>
              {/* Render sections dynamically based on sectionCount */}
              {[...Array(sectionCount)].map((_, index) => (
                <div key={index}>
                  <h3>Enviar Transacción</h3>
                  <textarea
                    name="stake_address"
                    id=""
                    className="w-full send_token"
                  ></textarea>

                  <div className="flex justify-between mt-4">
                    <div className="w-1/3 pr-2">
                      <input
                        type="text"
                        placeholder="Cantidad"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="w-1/3 px-2">
                      <button className="w-full bg-[#6C000D] text-white p-2 rounded">
                        Agregar Token
                      </button>
                    </div>
                    <div className="w-1/3 pl-2">
                      {index === sectionCount - 1 && (
                        <button
                          className="w-full bg-[#6C000D] text-white p-2 rounded"
                          onClick={() => setSectionCount(sectionCount + 1)}
                        >
                          +
                        </button>
                      )}
                      {index !== sectionCount - 1 && (
                        <button
                          className="w-full bg-red-500 text-white p-2 rounded"
                          onClick={() => setSectionCount(sectionCount - 1)}
                        >
                          -
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 1 && (
            <div>
              <h3>Stake Address </h3>
              <p>
                Comparte la dirección de tu billetera para recibir pagos o
                tokens
                addr_test1qpljcj5wgslf2gj8zq9yfnkv8srj5etz32k2puy0kkrh5lfk5yhgj2d94qveym6uc2a7zc73el777g7t99wt6msp4qlsehx5wv
              </p>
              {/* Agrega aquí el contenido específico para la pestaña "Recibir" */}
            </div>
          )}
          {activeTab === 2 && (
            <div>
              <h3>Historial de Transacciones</h3>
              <p></p>
              {/* Agrega aquí el contenido específico para la pestaña "Historial" */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
