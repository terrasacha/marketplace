export default function getTimeLive(timestamp: number) {
  // Obtener el timestamp actual
  const timestampActual = Math.floor(new Date().getTime() / 1000);

  // Calcular la diferencia en segundos
  const tiempoTranscurrido = timestampActual - timestamp;
  return tiempoTranscurrido;
}
