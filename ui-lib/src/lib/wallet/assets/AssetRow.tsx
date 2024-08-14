interface AssetRowProps {
  index: number;
  asset_name: string;
  quantity: string;
  price: string;
  total: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function AssetRow(props: AssetRowProps) {
  const { index, asset_name, quantity, price, total } = props;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white text-gray-800 rounded-lg px-4 py-3 cursor-pointer mb-2 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-2 md:mb-0">
        <div className="text-lg font-semibold text-[#0983a9]">{index + 1}</div>
        <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-[#0983a9] rounded-full">
          <span className="text-xl font-bold text-white">
            {asset_name.charAt(0)}
          </span>
        </div>
        <div className="text-lg font-medium">{asset_name}</div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center w-full md:w-1/2 space-y-2 md:space-y-0 md:space-x-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">Cantidad</p>
          <p className="text-lg font-semibold">{quantity}</p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">Precio Unitario</p>
          <p className="text-lg font-semibold">~ {price || '0'} USD</p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-lg font-semibold">~ {total || '0'} USD</p>
        </div>
      </div>
    </div>
  );
}
