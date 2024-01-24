import { useState } from 'react';
import Link from 'next/link';
import GoogleMapReact from 'google-map-react';
import {
  getImagesCategories,
  getProject,
  getProjectData,
} from '@terrasacha/backend';
import { Transition } from '@headlessui/react';
import PageHeader from '@terrasacha/components/common/PageHeader';
import { MyPage } from '@terrasacha/components/common/types';
import { getActualPeriod } from '@terrasacha/utils/generic/getActualPeriod';
import { mapProjectData } from '@terrasacha/lib/mappers';
import dynamic from 'next/dynamic';
import TabsComponents from '@terrasacha/components/home-page/TabsProject';
import FinancialTab from '@terrasacha/components/home-page/ProjectTabs/FinancialTab';
import EarningsTab from '@terrasacha/components/home-page/ProjectTabs/EarningsTab';
import ProjectionsTab from '@terrasacha/components/home-page/ProjectTabs/ProjectionsTab';

const ProjectDataModal = dynamic(
  () => import('@terrasacha/components/modals/ProjectDataModal')
);

const Product: MyPage = (props: any) => {
  const project = props.project;
  const projectData = props.projectData;
  const imageData = props.image;
  const tokenName: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_NAME';
    })[0]?.value || '0';

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

  const actualPeriod: any = getActualPeriod(Date.now(), periods);
  const totalTokensSold = project.transactions.items.reduce(
    (acc: any, item: any) => {
      return acc + item.amountOfTokens;
    },
    0
  );

  const totalTokensFromFirstToActualPeriod: number = tokenHistoricalData.reduce(
    (acc: any, hd: any) => {
      if (parseInt(hd.period) <= parseInt(actualPeriod.period)) {
        return acc + hd.amount;
      } else {
        return acc;
      }
    },
    0
  );

  const tokenUnits: number =
    totalTokensFromFirstToActualPeriod - parseInt(totalTokensSold);

  const coordString: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'C_ubicacion';
    })[0]?.value || '4.708392839967101, -74.06997219191005';
  let coords = coordString.split(' ');
  let lat: number = parseFloat(coords[0]);
  let lng: number = parseFloat(coords[1]);

  const porcentageBuyed: number =
    (parseInt(totalTokensSold) * 100) / tokenUnits;
  const createdAt: any = new Date(project.createdAt);
  const updatedAt: any = new Date(project.updatedAt);

  let relevantInfo = {
    name: project.name,
    dateOfInscription: project.createdAt.split('-')[0],
    category: project.category.name
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase()),
    encodedCategory: encodeURIComponent(project.categoryID),
    coordenadas: { lat, lng },
    price: actualPeriod?.price,
    tokenName: tokenName,
    totalTokensFromFirstToActualPeriod: totalTokensFromFirstToActualPeriod,
    tokenTotal: actualPeriod?.amount,
    tokenUnits: tokenUnits,
    porcentageBuyed: porcentageBuyed,
    createdAt: createdAt.toLocaleDateString('es-ES'),
    updatedAt: updatedAt.toLocaleDateString('es-ES'),
    tokenCurrency: tokenCurrency,
  };
  const [expanded, setExpanded] = useState(false);
  const [openModal, setOpenModal] = useState('');

  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Financieros', 'Ingresos', 'Proyección'];
  const tabComponents = [TabsComponents, TabsComponents, TabsComponents]; // Importa tus componentes
  const tabProps = [
    {
      title: 'Indicadores Financieros',
      description:
        'Esta sección proporciona una visión integral de la evaluación financiera del proyecto, indicadores esenciales para tomar decisiones informadas sobre la viabilidad y el éxito del proyecto, proporcionando una base sólida para la toma de decisiones estratégicas.',
      content: (
        <FinancialTab
          financialData={
            projectData.projectFinancialInfo.financialIndicators
              .financialIndicators
          }
        />
      ),
    },
    {
      title: 'Ingresos por producto',
      description:
        'Esta sección proporciona una visión integral de la evaluación financiera del proyecto, indicadores esenciales para tomar decisiones informadas sobre la viabilidad y el éxito del proyecto, proporcionando una base sólida para la toma de decisiones estratégicas.',
      content: (
        <EarningsTab
          earningsData={projectData.projectFinancialInfo.revenuesByProduct}
        />
      ),
    },
    {
      title: 'Proyección por proyecto',
      description:
        'Esta sección proporciona una visión integral de la evaluación financiera del proyecto, indicadores esenciales para tomar decisiones informadas sobre la viabilidad y el éxito del proyecto, proporcionando una base sólida para la toma de decisiones estratégicas.',
      content: <ProjectionsTab projectionData={project} />,
    },
  ];

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  const truncatedDescription =
    project.description?.split(' ').slice(0, 70).join(' ') || '' + '...';
  const fullDescription = project.description;
  return (
    <div className="project w-full pt-20 flex flex-col items-center bg-[#f4f8f9] ">
      <div className="project-detail h-auto w-11/12">
        <div className="details-general">
          <PageHeader imageURL={imageData}></PageHeader>
          <div className="project-categories relative h-auto pt-10 flex items-center">
            <div className="px-5 py-2 rounded-[.2rem] mr-2 text-xs text-[#1E446E] bg-[#D6F8F4]">
              {relevantInfo.category}
            </div>
            <div className="px-5 py-2 rounded-[.2rem] mr-2 text-xs text-[#1E446E] bg-[#D6F8F4]">
              {relevantInfo.dateOfInscription}
            </div>
          </div>
          <div className="sm:project-info pt-4 flex sm:flex-row flex-col flex-col-reverse">
            <div className="sm:details-map flex justify-end items-start sm:w-1/2 h-300 rounded-lg overflow-hidden ">
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: 'AIzaSyCzXTla3o3V7o72HS_mvJfpVaIcglon38U',
                }}
                defaultCenter={{
                  lat: projectData.projectInfo.location.coords.lat,
                  lng: projectData.projectInfo.location.coords.lng,
                }}
                defaultZoom={12}
                onGoogleApiLoaded={({ map, maps }) => {
                  // const contentString =
                  //   '<div id="content">' +
                  //   '<div id="siteNotice">' +
                  //   "</div>" +
                  //   '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
                  //   '<div id="bodyContent">' +
                  //   "<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
                  //   "sandstone rock formation in the southern part of the " +
                  //   "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
                  //   "south west of the nearest large town, Alice Springs; 450&#160;km " +
                  //   "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
                  //   "features of the Uluru - Kata Tjuta National Park. Uluru is " +
                  //   "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
                  //   "Aboriginal people of the area. It has many springs, waterholes, " +
                  //   "rock caves and ancient paintings. Uluru is listed as a World " +
                  //   "Heritage Site.</p>" +
                  //   '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
                  //   "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
                  //   "(last visited June 22, 2009).</p>" +
                  //   "</div>" +
                  //   "</div>";

                  // const infowindow = new maps.InfoWindow({
                  //   content: contentString,
                  //   ariaLabel: "Uluru",
                  // });

                  projectData.projectGeoData.map((geoData: any) => {
                    new maps.KmlLayer(geoData.fileURLS3, {
                      suppressInfoWindows: true,
                      preserveViewport: false,
                      map: map,
                    }).addListener('click', function (event: any) {});
                  });
                }}
                yesIWantToUseGoogleMapApiInternals
              ></GoogleMapReact>
            </div>
            <div className="sm:detail-info mt-2 sm:mt-0 sm:w-1/2 sm:pl-8">
              <div className="info-title">
                <h3 className="text-xl font-semibold">
                  {relevantInfo.name} |{' '}
                  {relevantInfo.tokenName ? relevantInfo.tokenName : 'ETH'}
                </h3>
                <p className="info-amount font-medium text-[#484848]">
                  Cantidad de tokens disponibles:{' '}
                  {relevantInfo.tokenUnits.toLocaleString('es-CO') + ' ' ||
                    '0 '}
                </p>
              </div>
              <div className="info-price pt-4">
                <div className="price text-[#2E7D96]">
                  {parseFloat(relevantInfo.price).toLocaleString('es-CO')}{' '}
                  {relevantInfo.tokenCurrency}
                  <span className="price-span">/ tCO2eq</span>
                </div>
                <div className="description-price pt-4 text-[#484848]">
                  <Transition
                    show={expanded}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    {(ref) => (
                      <p className="text-gray-800 md:text-sm">
                        {fullDescription}
                      </p>
                    )}
                  </Transition>
                  {!expanded && (
                    <div>
                      <p className="text-xs text-gray-80 md:text-sm">
                        {truncatedDescription}
                      </p>
                      {truncatedDescription.length !==
                        fullDescription.length && (
                        <button
                          className="text-[#1E446E] underline text-xs"
                          onClick={toggleExpand}
                        >
                          Leer más
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row">
                  <div className="flex flex-col items-center justify-center h-32 sm:w-1/2">
                    <div className="w-11/12">
                      <h4 className="pb-2 font-semibold">Status</h4>
                      <div className="w-full bg-[#A7E4EC]  h-2 dark:bg-gray-700">
                        <div
                          className="bg-[#287993] h-2"
                          style={{ width: `${relevantInfo.porcentageBuyed}%` }}
                        ></div>
                      </div>
                      <p className="flex relative w-full text-sm pt-2 items-center">
                        <svg
                          className="w-3 h-3 text-[#287993] dark:text-white mr-2"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 21 21"
                        >
                          <path d="M20.817 9.085a10 10 0 0 0-19.77 2.9A10.108 10.108 0 0 0 6.762 20a9.689 9.689 0 0 0 4.2 1h.012a3.011 3.011 0 0 0 2.144-.884A2.968 2.968 0 0 0 14 18v-.86A1.041 1.041 0 0 1 15 16h2.7a2.976 2.976 0 0 0 2.838-2.024 9.93 9.93 0 0 0 .279-4.891ZM5.5 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2.707-3.793a1 1 0 1 1-1.414-1.414 1 1 0 0 1 1.414 1.414Zm2.872-1.624a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm4.128 1.624a1 1 0 1 1-1.414-1.413 1 1 0 0 1 1.414 1.413Z" />
                        </svg>
                        Total Retirements{' '}
                        <span className="absolute right-1 font-semibold">
                          {project.counterNumberOfTimesBuyed}
                        </span>
                      </p>
                      <p className="flex relative w-full text-sm items-center">
                        <svg
                          className="w-3 h-3 text-[#A7E4EC] dark:text-white mr-2"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 21 21"
                        >
                          <path d="M20.817 9.085a10 10 0 0 0-19.77 2.9A10.108 10.108 0 0 0 6.762 20a9.689 9.689 0 0 0 4.2 1h.012a3.011 3.011 0 0 0 2.144-.884A2.968 2.968 0 0 0 14 18v-.86A1.041 1.041 0 0 1 15 16h2.7a2.976 2.976 0 0 0 2.838-2.024 9.93 9.93 0 0 0 .279-4.891ZM5.5 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2.707-3.793a1 1 0 1 1-1.414-1.414 1 1 0 0 1 1.414 1.414Zm2.872-1.624a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm4.128 1.624a1 1 0 1 1-1.414-1.413 1 1 0 0 1 1.414 1.413Z" />
                        </svg>
                        Suministro Restante{' '}
                        <span className="absolute right-1 font-semibold">
                          {relevantInfo.tokenUnits
                            ? relevantInfo.tokenUnits.toLocaleString('es-CO')
                            : 0}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="description-cta flex pt-8  flex-col sm:w-1/2">
                    <Link href={`/projects/${project.id}/purchase`}>
                      <button className="block mb-2 mx-auto border rounded-lg text-sm text-white bg-[#2E7D96] py-2 px-10 border-[#2E7D96]  hover:bg-[#436d7b]">
                        Comprar
                      </button>
                    </Link>
                    <a
                      href="#"
                      className="details_register text-[#287993] pt-2 pl-1 mb-2 text-center"
                      onClick={() => setOpenModal('projectDataModal')}
                    >
                      Ver detalles de registro
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-1 w-11/12"></div>
      <div className="detail-tabs">
        <div className="detail-div border-[#ABABAB] flex justify-center">
          <div className="tabs mt-2 pt-2 flex md:flex-row  flex-col">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`" m-2 border rounded-lg text-[#2E2F30] py-2 px-10 border-[#D9D9D9] hover:bg-[#1F0004] ${
                  activeTab === index
                    ? 'border-b-2 border-[#1F0004] text-[#FFF] bg-[#6C000D] font-bold'
                    : 'bg-[#D9D9D9] font-semibold border-b-2 border-transparent '
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="tab-component mt-4 p-8 rounded-lg bg-[#FFF]">
          {tabComponents.map((TabComponent, index) => (
            <div key={index} className={activeTab === index ? '' : 'hidden'}>
              <TabComponent tabData={tabProps[index]} />
            </div>
          ))}
        </div>
      </div>
      {openModal === 'projectDataModal' && (
        <ProjectDataModal
          setOpenModal={setOpenModal}
          projectData={projectData}
          project={project}
        ></ProjectDataModal>
      )}
    </div>
  );
};

export default Product;
Product.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { projectId } = context.params;

  const project = await getProject(projectId);
  const projectData = await getProjectData(projectId);
  const mappedProjectdata = await mapProjectData(projectData);
  const image = await getImagesCategories(
    encodeURIComponent(`${project.categoryID}_banner`)
  );
  return {
    props: {
      project: project,
      projectData: mappedProjectdata,
      image: image,
    },
  };
}
