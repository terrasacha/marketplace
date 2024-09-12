
export default function getActualPeriod(actualDate: any, periods: any) {
    actualDate = new Date(actualDate);
    periods.sort((a:any, b:any) => a.date - b.date);
  
    let fechaInicio = new Date(-8640000000000000); // Un día antes del mínimo valor de Date.
  
    for (let i = 0; i < periods.length; i++) {
      const periodo = periods[i];
      const fechaFin = new Date(periodo.date);
  
      if (actualDate >= fechaInicio && actualDate <= fechaFin) {
        return { period: periodo.period, amount: periodo.amount, price:periodo.price, fechaInicio, fechaFin };
      }
  
      fechaInicio = new Date(periodo.date);
    }
  
    return null;
  };