export default function hexToText(hex: string) {
  const buffer = Buffer.from(hex, 'hex');

  const texto = buffer.toString('utf-8');

  return texto;
}
