export default function assetDifference(
  input: any,
  output: any,
  tx_type: string
) {
  if (tx_type === 'received' || tx_type === 'internal') {
    // Copiar el primer objeto para no modificar el original
    const resultado = { ...output };

    // Iterar sobre las claves del segundo objeto
    for (const key in input) {
      // Verificar si la clave existe en el primer objeto antes de restar
      if (resultado.hasOwnProperty(key)) {
        resultado[key] -= input[key];

        // Eliminar la clave si el resultado es 0 o negativo
        if (resultado[key] <= 0) {
          delete resultado[key];
        }
      }
    }

    return resultado;
  }

  if (tx_type === 'sent' || tx_type === 'preview') {
    // Copiar el primer objeto para no modificar el original
    const resultado = { ...input };

    // Iterar sobre las claves del segundo objeto
    for (const key in output) {
      // Verificar si la clave existe en el primer objeto antes de restar
      if (resultado.hasOwnProperty(key)) {
        resultado[key] -= output[key];

        // Eliminar la clave si el resultado es 0 o negativo
        if (resultado[key] <= 0) {
          delete resultado[key];
        }
      }
    }

    return resultado;
  }
}
