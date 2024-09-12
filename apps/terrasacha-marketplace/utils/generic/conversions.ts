// Convert posixtime in milliseconds to date format
export const posixtimeToDate = (time: string) => {
  const posixtime = parseInt(time, 10);
  const date = new Date(posixtime);
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
};

// Use to clamp long text to 64 characters as metadata in Cardano cannot have more than this value
// export function splitLongValues(obj: any): any {
//   const maxCharLimit = 64;
//   const newObj: any = {};
//   for (const [key, value] of Object.entries(obj)) {
//     if (typeof value === "string" && value.length > maxCharLimit) {
//       const words = value.split(" ");
//       const paragraphs: string[] = [];
//       let currentParagraph = "";
//       for (const word of words) {
//         if (currentParagraph.length + word.length + 1 <= maxCharLimit) {
//           currentParagraph += (currentParagraph.length > 0 ? " " : "") + word;
//         } else {
//           paragraphs.push(currentParagraph);
//           currentParagraph = word;
//         }
//       }
//       if (currentParagraph.length > 0) {
//         paragraphs.push(currentParagraph);
//       }
//       newObj[key] = paragraphs;
//     } else {
//       newObj[key] = value;
//     }
//   }
//   return newObj;
// }


export function splitLongValues(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      if (obj[key].length <= 62) {
        newObj[key] = obj[key]; // No dividir si es menor o igual a 62 caracteres
      } else {
        newObj[key] = splitStringIntoSections(obj[key]); // Dividir si es mayor a 62 caracteres
      }
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

function splitStringIntoSections(inputString: any, sectionLength = 62) {
  const sections = [];
  const words = inputString.split(' '); // Dividir la cadena en palabras

  let currentSection = '';
  let extraCharsCount = 0; // Contador para caracteres adicionales

  for (const word of words) {
    // Verificar si agregar la palabra excede la longitud máxima de la sección
    if ((currentSection + ' ' + word).length + extraCharsCount <= sectionLength) {
      // Si no excede, agregar la palabra a la sección actual
      if (currentSection !== '') {
        currentSection += ' ';
      }
      currentSection += word;
      
      // Contar caracteres adicionales por cada barra invertida (\) o salto de línea (\n)
      const specialCharsCount = (word.match(/\\/g) || []).length + (word.match(/\n/g) || []).length;
      extraCharsCount += specialCharsCount;
    } else {
      // Si excede, agregar la sección actual al resultado y comenzar una nueva sección con la palabra actual
      sections.push(currentSection);
      currentSection = word;
      extraCharsCount = 0; // Reiniciar el contador de caracteres adicionales
    }
  }

  // Agregar la última sección al resultado
  if (currentSection !== '') {
    sections.push(currentSection);
  }

  return sections;
}


export function txHashLink(txHash: string) {
  if (txHash != undefined) {
    const maxLength = 10;
    const displayString =
      txHash.length > maxLength
        ? txHash.substring(0, maxLength) +
          "..." +
          txHash.substring(txHash.length - maxLength)
        : txHash;

    return displayString;
  }
}
