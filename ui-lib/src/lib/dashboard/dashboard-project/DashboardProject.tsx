import { LineChartComponent } from "../../ui-lib";
import { getActualPeriod } from "@marketplaces/utils-2";
import DefaultCard from "./DefaultCard";
import TokenCard from "./TokenCard";

export default function DashboardProject(props: any){
    const project = props.project;
    const projectData = props.projectData;

    const projectStatusMapper: any = {
      draft: 'En borrador',
      verified: 'Verificado',
      on_verification: 'En verificación',
      in_blockchain: 'En blockchain',
      in_equilibrium: 'En equilibrio',
      Prefactibilidad: 'En Prefactibilidad',
      Factibilidad: 'En Factibilidad',
      'Documento de diseño del proyecto': 'En diseño de documento del proyecto',
      'Validación externa': 'En validación externa',
      'Registro del proyecto': 'Registrado',
    };
    const tokenHistoricalData = JSON.parse(
      project.productFeatures.items.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
      })[0]?.value || '[]'
    );
  
    const tokenCurrency: string =
      project.productFeatures.items.filter((item: any) => {
        return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
      })[0]?.value || '';
    const periods = tokenHistoricalData.map((tkhd: any) => {
      return {
        period: tkhd.period,
        date: new Date(tkhd.date),
        price: tkhd.price,
        amount: tkhd.amount,
      };
    });
    const actualPeriod = getActualPeriod(Date.now(), periods);
    const totalTokensSold = project.transactions.items.reduce(
      (acc: any, item: any) => {
        return acc + item.amountOfTokens;
      },
      0
    );
  
    let relevantInfo = {
      name: project.name
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
      status: projectStatusMapper[project.status],
      dateOfInscription: project.createdAt.split('-')[0],
      category: project.category.name
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
      encodedCategory: encodeURIComponent(project.categoryID),
      tokenTotal: parseInt(actualPeriod?.amount),
      tokenUnits: parseInt(actualPeriod?.amount) - parseInt(totalTokensSold),
      tokenValue: actualPeriod?.price,
      tokenCurrency: tokenCurrency,
    };
    const formatProjectDuration = (data : any) =>{
      console.log(data)
      let year = ''
      let month = ''
      let day = ''

      if(data.days && data.days > 0){
        day = data.days > 1? ` y ${data.days} días` :  ` y ${data.days} día`
      } 
      if(data.months && data.months > 0){
        month = data.months > 1? ` ${data.months} meses` :  ` ${data.months} mes`
      } 
      if(data.years && data.years > 0){
        year = data.years > 1? `${data.years} años,` :  `${data.years} año,`
      } 
     return  `${year}${month}${day}`
    }
    let projectDuration = formatProjectDuration(projectData.projectInfo.token.lifeTimeProject)

    return(
        <div className="bg-[#F4F8F9] h-auto w-full px-5 pt-6">
        <h2 className="p-4 text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-500">
          {project.name}
        </h2>
  
        <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
          <div className="row-span-2 lg:col-span-1 2xl:col-span-1 lg:row-span-2">
            <TokenCard projectName={project.name} categoryName={projectData.projectInfo.category}/>
          </div>
          {
          [
            { title: "Total tokens vendidos", value: relevantInfo.tokenUnits ? `${relevantInfo.tokenUnits.toLocaleString('es-CO')} ` : '0' },
            { title: "Tokens propios" },
            { title: "Capital invertido" },
            { title: "Precio actual del token", value: projectData.projectInfo.token.actualPeriodTokenPrice },
            { title: "Ganancias" },
            { title: "Areas terreno", value: `${projectData.projectInfo.area} ha`}
          ].map((info, index) => (
            <div key={index} className="lg:col-span-1">
              <DefaultCard title={info.title} value={info.value} />
            </div>
          ))
          }
          
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6 mt-8">
          
          <div className="bg-custom-dark-hover p-4 rounded-md shadow-lg col-span-2 lg:col-span-4 2xl:col-span-3 lg:row-span-3 flex justify-center h-80">
            <LineChartComponent />
          </div>
          {
            [
              { title: "Colombia" },
              { title: "Tokens disponibles", value: projectData.projectInfo.token.actualPeriodTokenAmount },
              { title: "Periodo actual", value: projectData.projectInfo.token.actualPeriod }
            ].map((info, index) => (
              <div key={index} className={`lg:col-span-${index === 0 ? '2 2xl:col-span-1' : '1'} flex justify-center items-${index === 0 ? 'start' : 'center'}`}>
                <DefaultCard title={info.title} value={info.value} />
              </div>
            ))
          }
        
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-6 mt-8">
          {
            [
              { title: "Progreso proyecto", value:`${(projectData.projectInfo.token.actualPeriod / projectData.projectInfo.token.historicalData.length) * 100} %` },
              { title: "Duración proyecto", value: projectDuration }
            ].map((info, index) => (
              <div key={index} className={`lg:col-span-${info.value ? '1' : '1 '}`}>
                <DefaultCard title={info.title} value={info.value} />
              </div>
            ))
          }
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-6 mt-8">
          
          <div className="lg:col-span-1 border border-pink-700 p-4">
            Box
          </div>
          
          <div className="lg:col-span-1 border border-pink-700 p-4">
            Box
          </div>
        </div>
      </div>
    )
}