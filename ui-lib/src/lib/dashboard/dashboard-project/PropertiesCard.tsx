export default function PropertiesCard(props: any) {
  const { properties } = props;

  return (
    <div className="p-4 border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 bg-custom-fondo h-full w-full flex flex-col justify-center items-center animate-fade animate-ease-in animate-duration-300 gap-1">
      <h4 className="text-sm font-semibold mb-5">Predios asociados al proyecto</h4>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="text-left">Nombre</th>
            <th className="text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property: any) => (
            <tr key={property.id}>
              <td className="border-b">{property.name}</td>
              <td className="border-b">
                <a href={`/property/${property.id}/dashboard`} className="text-blue-500 hover:underline">
                  Ver Predio
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
