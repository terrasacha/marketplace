import { useRouter } from 'next/router';

interface ScriptRowProps {
  index: number;
  scriptName: string;
  pbk: string;
  testnetAddr: string;
  tokenName: string;
  policyId: string;
  handleOpenMintModal: (policyId: string) => void;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function ScriptRow(props: ScriptRowProps) {
  const {
    index,
    scriptName,
    pbk,
    testnetAddr,
    tokenName,
    policyId,
    handleOpenMintModal,
  } = props;

  return (
    <tr className="bg-custom-dark border-b-8 border-custom-fondo">
      <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
        {scriptName}
      </th>
      <td className="px-6 py-4">{pbk}</td>
      <td className="px-6 py-4">{testnetAddr}</td>
      <td className="px-6 py-4">{tokenName}</td>
      <td className="px-6 py-4">
        <button
          className="flex justify-center text-custom-dark bg-white hover:bg-[#F6F6F6] focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5"
          onClick={() => handleOpenMintModal(policyId)}
        >
          Crear
        </button>
      </td>
    </tr>
  );
}
