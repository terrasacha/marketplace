export function validarString(str: string, regex: RegExp): string {
  if (!regex.test(str)) {
    return "Caracteres no permitidos";
  }
  return "";
}

export const parseSerializedKoboData = async (data: any) => {
  const contenido = data.replace(/[{}[\]]/g, "");
  const pares = contenido.split(", ");

  const parsedData: any = {};

  pares.forEach((par: any) => {
    const [clave, valor] = par.split("=");
    if (clave === "D_actual_use" || clave === "D_replace_use") {
      parsedData[clave] = valor.split("|");
    } else {
      parsedData[clave] = valor;
    }
  });

  return parsedData;
};

export const convertAWSDatetimeToDate = (AWSDatetime: any) => {
  const fechaObjeto = new Date(AWSDatetime);
  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

export const getYearFromAWSDatetime = (AWSDatetime: any) => {
  const fechaObjeto = new Date(AWSDatetime);
  const anio = fechaObjeto.getFullYear();

  return anio;
};

export const formatNumberWithThousandsSeparator = (number: any) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const getElapsedTime = async (initDate: any, endDate: any = new Date()) => {
  const diferenciaEnMilisegundos = endDate.getTime() - new Date(initDate).getTime();
  let minutosTranscurridos = Math.floor(diferenciaEnMilisegundos / (1000 * 60));
  let elapsedTime = "";
  if (minutosTranscurridos < 60) {
    elapsedTime = `Hace ${minutosTranscurridos} minutos`;
  }
  if (minutosTranscurridos >= 60 && minutosTranscurridos < 1440) {
    minutosTranscurridos = Math.floor(minutosTranscurridos / 60);
    elapsedTime = `Hace ${minutosTranscurridos} horas`;
  }
  if (minutosTranscurridos >= 1440) {
    minutosTranscurridos = Math.floor(minutosTranscurridos / 1440);
    elapsedTime = `Hace ${minutosTranscurridos} dias`;
  }

  return elapsedTime;
};

export const capitalizeWords = async (str: any) => {
  const lowercaseStr = str.toLowerCase();

  const words = lowercaseStr.split(" ");

  const capitalizedWords = words.map((word: any) => {
    if (word.length > 0) {
      return word[0].toUpperCase() + word.slice(1);
    } else {
      return word;
    }
  });

  return capitalizedWords.join(" ");
};

export const getImagesCategories = (category: any) => {
  try {
    let url = `${process.env['NEXT_PUBLIC_s3EndPoint']}public/category-projects-images/${category}.avif`;
    url = url.replace("REDD+", "REDD%2B");
    return url;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const getActualPeriod = async (actualDate: any, periods: any) => {
  actualDate = new Date(actualDate);

  periods.sort((a: any, b: any) => a.date - b.date);

  // Inicializamos fechaInicio de la primera iteración como menos infinito.
  let fechaInicio = new Date(-8640000000000000); // Un día antes del mínimo valor de Date.

  for (let i = 0; i < periods.length; i++) {
    const periodo = periods[i];
    const fechaFin = new Date(periodo.date);

    // console.log("actualDate", actualDate);
    // console.log("fechaInicio", fechaInicio);
    // console.log("fechaFin", fechaFin);
    // Verifica si la fecha actual está dentro del rango desde "fechaInicio" hasta "fechaFin".
    if (actualDate >= fechaInicio && actualDate <= fechaFin) {
      return { period: periodo.period, amount: periodo.amount, price: periodo.price, fechaInicio, fechaFin };
    }

    // Actualiza "fechaInicio" para la próxima iteración.
    fechaInicio = new Date(periodo.date);
  }

  return null;
};

export const hasNonEmptyValue = (obj: any) => {
  function checkProperties(obj: any) {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkProperties(obj[key])) {
          return true;
        }
      } else if (obj[key] !== '') {
        return true;
      }
    }
    return false;
  }

  return checkProperties(obj);
}