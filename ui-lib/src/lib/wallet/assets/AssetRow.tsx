interface AssetRowProps {
  index: number;
  asset_name: string;
  quantity: number | string; // Cantidad del usuario
  total_quantity?: number | string; // Cantidad total del asset en el policy (opcional, se cargará en modal)
  price?: string; // Opcional, no se muestra inicialmente
  total?: string; // Opcional, no se muestra inicialmente
  metadata?: any; // Opcional, se cargará en modal
  onchain_metadata?: any; // Opcional, se cargará en modal
  mint_or_burn_count?: number; // Opcional, se cargará en modal
  initial_mint_tx_hash?: string; // Opcional, se cargará en modal
}

// Función helper para convertir URL IPFS a gateway URL
const convertIpfsUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Si ya es una URL HTTP/HTTPS, retornarla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si es IPFS, convertir a gateway
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `https://coffee-dry-barnacle-850.mypinata.cloud/ipfs/${hash}`;
  }
  
  // Si es solo el hash IPFS (sin prefijo), agregar gateway
  if (url.startsWith('Qm') || url.startsWith('baf')) {
    return `https://coffee-dry-barnacle-850.mypinata.cloud/ipfs/${url}`;
  }
  
  return url;
};

export default function AssetRow(props: AssetRowProps) {
  const { asset_name, quantity, metadata, onchain_metadata } = props;

  // Formatear cantidad
  const formattedQuantity = typeof quantity === 'string' 
    ? parseInt(quantity.replace(/,/g, '')) || 0 
    : quantity;

  // Obtener logo/imagen de múltiples fuentes posibles
  const assetLogo = convertIpfsUrl(
    metadata?.logo || 
    metadata?.raw?.image || 
    onchain_metadata?.image || 
    null
  );

  // Generar color de la barra inferior basado en el índice (rotación de colores Terrasacha)
  const getBarColor = (index: number) => {
    const colors = [
      'bg-[#849b50]', // Verde Pradera
      'bg-[#6e6c35]', // Verde Selva
      'bg-[#b1c181]', // Verde Claro
      'bg-[#e8d79a]', // Amarillo Tierra
      'bg-[#44482c]', // Verde Bosques Nublados
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="relative bg-white border border-[#b1c181]/30 rounded-xl shadow-sm hover:shadow-lg hover:border-[#849b50]/50 transition-all duration-200 cursor-pointer overflow-hidden group flex flex-col h-full">
      {/* Contenido principal */}
      <div className="flex flex-col items-center p-4 pb-3 flex-1">
        {/* Avatar/Logo */}
        {assetLogo ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#b1c181]/50 group-hover:border-[#849b50] transition-colors mb-3">
            <img 
              src={assetLogo} 
              alt={asset_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-[#849b50] to-[#6e6c35] flex items-center justify-center">
                    <span class="font-bold text-white text-xl">${asset_name.charAt(0).toUpperCase()}</span>
                  </div>
                `;
              }}
            />
          </div>
        ) : (
          <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-gradient-to-br from-[#849b50] to-[#6e6c35] rounded-full shadow-md group-hover:scale-110 transition-transform duration-200 mb-3">
            <span className="font-bold text-white text-xl">
              {asset_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Nombre del asset */}
        <h3 className="text-sm font-bold text-[#44482c] group-hover:text-[#6e6c35] transition-colors text-center mb-2 line-clamp-2 min-h-[2.5rem]">
          {asset_name}
        </h3>
        
        {/* Cantidad */}
        <div className="text-center mt-auto">
          <p className="text-lg font-bold text-[#44482c]">{formattedQuantity.toLocaleString('es-CO')}</p>
        </div>
      </div>

      {/* Barra de color inferior */}
      <div className={`h-1.5 ${getBarColor(props.index)} group-hover:h-2 transition-all duration-200`} />
    </div>
  );
}
