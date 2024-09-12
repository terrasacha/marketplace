import Card from "../../common/Card";

export default function ActualUseAndPotentialInfoCard({
    actualUse,
    replaceUse,
  }: any) {
    return (
      <Card className="h-fit">
            <Card.Header title="Uso actual y potencial" />
            <Card.Body>
        <div className="flow-root">
          <div className="">
            <ul className="general-list grid sm:grid-cols-1">
              <li className="general-item mb-2">
                <div className="p-4 border  shadow-sm">
                  <div className="text-md font-bold">Uso actual del suelo del predio</div>
                  <div>{actualUse.types.includes("Potreros") && (
                    <div className="flex flex-col pt-4">
                    <p className="text-sm font-semibold">Potreros</p>
                    <p className="text-sm font-semibold">Cantidad (héctareas):<span className="font-normal">{actualUse.potreros.ha}</span></p>
                  </div>
                  )}
                    {actualUse.types.includes("Plantaciones Forestales 1") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Plantación: <span className="font-normal">{actualUse.potreros.ha}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.plantacionesForestales1.ha}</span></p>
                      </div>
                    )}
                    {actualUse.types.includes("Plantaciones Forestales 2") && (
                       <div className="flex flex-col pt-4">
                       <p className="text-sm font-semibold">Plantación: <span className="font-normal">{actualUse.plantacionesForestales2.especie}</span></p>
                       <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.plantacionesForestales2.ha}</span></p>
                     </div>
                    )}
                    {actualUse.types.includes("Plantaciones Forestales 3") && (
                      <div className="flex flex-col pt-4">
                      <p className="text-sm font-semibold">Plantación: <span className="font-normal">{actualUse.plantacionesForestales3.especie}</span></p>
                      <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.plantacionesForestales3.ha}</span></p>
                    </div>
                    )}
                    {actualUse.types.includes("Frutales 1") && (
                      <div className="flex flex-col pt-4">
                      <p className="text-sm font-semibold">Frutales: <span className="font-normal">{actualUse.frutales1.especie}</span></p>
                      <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.frutales1.ha}</span></p>
                    </div>
                    )}
                    {actualUse.types.includes("Frutales 2") && (
                      <div className="flex flex-col pt-4">
                      <p className="text-sm font-semibold">Frutales: <span className="font-normal">{actualUse.frutales2.especie}</span></p>
                      <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.frutales2.ha}</span></p>
                    </div>
                    )}
                    {actualUse.types.includes("Otros") && (
                      <div className="flex flex-col pt-4">
                      <p className="text-sm font-semibold">Otros: <span className="font-normal">{actualUse.otros.especie}</span></p>
                      <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.otros.ha}</span></p>
                    </div>
                    )}
                  </div>
                </div>
              </li>
              <li className="general-item mb-2">
                <div className="p-4 border  shadow-sm">
                  <div className="text-md font-bold">Usos actuales reemplazables</div>
                  <div> {replaceUse.types.includes("Potreros") && (
                    <div className="flex flex-col pt-4">
                      <p className="text-sm font-semibold">Potreros</p>
                      <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.potreros.newUse}</span></p>
                      <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{actualUse.otros.ha}</span></p>
                    </div>
                    
                  )}
                    {replaceUse.types.includes("Plantaciones Forestales 1") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Plantaciones Forestales 1</p>
                        <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.plantacionesForestales1.newUse}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{replaceUse.plantacionesForestales1.ha}</span></p>
                      </div>
                    )}
                    {replaceUse.types.includes("Plantaciones Forestales 2") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Plantaciones Forestales 2</p>
                        <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.plantacionesForestales2.newUse}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{replaceUse.plantacionesForestales2.ha}</span></p>
                      </div>
                    )}
                    {replaceUse.types.includes("Plantaciones Forestales 3") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Plantaciones Forestales 3</p>
                        <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.plantacionesForestales3.newUse}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{replaceUse.plantacionesForestales3.ha}</span></p>
                      </div>
                    )}
                    {replaceUse.types.includes("Frutales 1") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Frutales 1</p>
                        <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.frutales1.newUse}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{replaceUse.frutales1.ha}</span></p>
                      </div>
                    )}
                    {replaceUse.types.includes("Frutales 2") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Frutales 2</p>
                        <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.frutales2.newUse}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{replaceUse.frutales2.ha}</span></p>
                      </div>
                    )}
                    {replaceUse.types.includes("Otros") && (
                      <div className="flex flex-col pt-4">
                        <p className="text-sm font-semibold">Otros</p>
                        <p className="text-sm font-semibold">¿A qué tipo de Uso de Suelo? <span className="font-normal">{replaceUse.otros.newUse}</span></p>
                        <p className="text-sm font-semibold">Cantidad de héctareas a reemplazar: <span className="font-normal">{replaceUse.otros.ha}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        </Card.Body>
      </Card>
    );
  }
  