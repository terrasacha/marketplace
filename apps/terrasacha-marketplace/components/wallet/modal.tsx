import React from 'react';

// Definir el tipo de 'token'
interface Token {
  id: number;
  title: string;
  image: string;
  description: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

interface ModalProps {
  token: Token;
  closeModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ token, closeModal }) => {
  return (
    // Estructura de tu modal aquí
    <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={closeModal}>&times;</span>
      
      {/* Header con imagen a la izquierda y título y columnas a la derecha */}
      <div className="modal-header">
        <div className="header-image" style={{ width: '30%' }}>
          <img src={token.image} alt={token.title} style={{ width: '100%' }} />
        </div>
        <div className="header-content" style={{ width: '70%', padding: '0 10px' }}>
          <h2>{token.title}</h2>
          <div className="header-columns" style={{ display: 'flex' }}>
            {/* Columna 1 */}
            <div style={{ flex: '1', marginRight: '10px' }}>
              {/* Contenido de la columna 1 */}
            </div>
            
            {/* Columna 2 */}
            <div style={{ flex: '1' }}>
              {/* Contenido de la columna 2 */}
            </div>
          </div>
        </div>
      </div>

      {/* Texto debajo del header */}
      <div className="modal-text">
        <p>{token.description}</p>
      </div>

      {/* Otra información específica del token */}
    </div>
  </div>

  );
};

export default Modal;
