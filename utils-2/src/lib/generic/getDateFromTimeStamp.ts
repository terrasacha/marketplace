export default function getDateFromTimeStamp(timestamp: number) {
  const date = new Date(timestamp * 1000); // Multiplicamos por 1000 para convertir segundos a milisegundos

  const formattedTime = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${formattedTime}`;

  return formattedDate;

}