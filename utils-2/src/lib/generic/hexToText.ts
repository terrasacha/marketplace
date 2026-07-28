/**
 * Convierte un asset name en hex (Cardano) a texto legible.
 * Maneja labels CIP-68 y evita devolver caracteres basura no imprimibles.
 */
export default function hexToText(hex: string): string {
  if (!hex || typeof hex !== 'string') return '';

  const cleanHex = hex.replace(/^0x/i, '').trim();
  if (!cleanHex) return '';

  // Si no es hex válido, devolver tal cual (ya podría ser texto)
  if (!/^[0-9a-fA-F]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
    return isMostlyPrintable(hex) ? hex : truncateFallback(cleanHex || hex);
  }

  // CIP-68: primeros 4 bytes son el label (reference NFT / FT / NFT)
  const cip68Labels = ['000de140', '000643b0', '0014df10'];
  let nameHex = cleanHex;
  if (cleanHex.length > 8 && cip68Labels.some((label) => cleanHex.toLowerCase().startsWith(label))) {
    nameHex = cleanHex.slice(8);
  }

  try {
    const text = Buffer.from(nameHex, 'hex').toString('utf8');
    const printable = stripNonPrintable(text);

    if (printable.length > 0 && printable.length >= Math.ceil(text.length * 0.6)) {
      return printable;
    }
  } catch {
    // Continuar con fallback
  }

  return truncateFallback(cleanHex);
}

export const formatAssetDisplayName = (
  assetName?: string,
  assetNameHex?: string,
  options?: { maxLength?: number }
): string => {
  const maxLength = options?.maxLength ?? 28;

  const candidates = [assetName, assetNameHex ? hexToText(assetNameHex) : '']
    .map((value) => (value || '').trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    if (isMostlyPrintable(candidate)) {
      return truncateLabel(candidate, maxLength);
    }
  }

  if (assetNameHex && /^[0-9a-fA-F]+$/.test(assetNameHex)) {
    return truncateFallback(assetNameHex);
  }

  return 'Token desconocido';
};

const stripNonPrintable = (text: string): string => {
  return [...text]
    .filter((char) => {
      const code = char.charCodeAt(0);
      // Printable ASCII + Latin-1 letters commonly used in names
      return (
        (code >= 32 && code <= 126) ||
        (code >= 160 && code <= 255) ||
        code === 9
      );
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
};

const isMostlyPrintable = (text: string): boolean => {
  if (!text) return false;
  const printable = stripNonPrintable(text);
  return printable.length > 0 && printable.length >= Math.ceil(text.length * 0.7);
};

const truncateFallback = (hex: string): string => {
  if (hex.length <= 12) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-4)}`;
};

const truncateLabel = (label: string, maxLength: number): string => {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
};
