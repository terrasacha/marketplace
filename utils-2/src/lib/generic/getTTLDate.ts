export default function getTTLDate(ttlMs: number) {
  const fechaActual = new Date();

  fechaActual.setTime(fechaActual.getTime() + ttlMs);

  return fechaActual.toLocaleString();
}
