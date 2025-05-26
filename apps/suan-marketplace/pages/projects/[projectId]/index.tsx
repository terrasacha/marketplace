import { useEffect, useState } from 'react';
import Link from 'next/link';
import GoogleMapReact from 'google-map-react';
import { Transition } from '@headlessui/react';
import { MyPage } from '../../../components/common/types';
import { getActualPeriod } from '../../../utils/generic/getActualPeriod';
import { mapProjectData } from '../../../lib/mappers';
import dynamic from 'next/dynamic';
import TabsComponents from '@suan/components/home-page/TabsProject';
const FinancialTab = dynamic(
  () => import('@suan/components/home-page/ProjectTabs/FinancialTab')
);
const EarningsTab = dynamic(
  () => import('@suan/components/home-page/ProjectTabs/EarningsTab')
);
const ProjectionsTab = dynamic(
  () => import('@suan/components/home-page/ProjectTabs/ProjectionsTab')
);
import Card from '@marketplaces/ui-lib/src/lib/common/Card';
import PageHeader from '@marketplaces/ui-lib/src/lib/common/PageHeader';
import { useRouter } from 'next/router';
import {
  getImagesCategories,
  getProject,
  getProjectData,
} from '@marketplaces/data-access';

const ProjectDataModal = dynamic(
  () => import('@suan/components/modals/ProjectDataModal')
);

const Product: MyPage = (props: any) => {
  const router = useRouter();
  const project = props.project;
  const projectData = props.projectData;
  const imageData = props.image;

  const [availableTokenAmount, setAvailableTokenAmount] = useState<
    number | null
  >(null);

  useEffect(() => {
    const getAvailableTokens = async (
      spendContractAddress: string,
      tokenName: string,
      tokenContractId: string
    ) => {
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(spendContractAddress),
        }
      );
      const spentWalletData = await response.json();

      console.log('spendData', spentWalletData);

      if (!spentWalletData) {
        console.log('Parece que un error ha ocurrido ...');
      }

      const investorProjectTokensAmount = spentWalletData.assets.reduce(
        (sum: number, item: any) => {
          if (
            item.asset_name === tokenName &&
            item.policy_id === tokenContractId
          ) {
            return sum + parseInt(item.quantity);
          }
        },
        0
      );
      setAvailableTokenAmount(investorProjectTokensAmount);
      return investorProjectTokensAmount;
    };

    // Obtener del endpoint de luis la cantidad de tokens disponibles para comprar
    const mintProjectTokenContract = project.scripts.items.find(
      (script: any) =>
        script.script_type === 'mintProjectToken' && script.Active === true
    );

    console.log('project.scripts', project.scripts);
    console.log('mintProjectTokenContract', mintProjectTokenContract);

    const spendContractFromMintProjectToken = project.scripts.items.find(
      (script: any) =>
        script.script_type === 'spendProject' && script.Active === true
    );

    if (mintProjectTokenContract && spendContractFromMintProjectToken) {
      getAvailableTokens(
        spendContractFromMintProjectToken.testnetAddr,
        mintProjectTokenContract.token_name,
        mintProjectTokenContract.id
      );
    }
  }, []);

  // useEffect(() => {
  //   async function updatePredialData() {
  //     const cadastralNumbersArray =
  //       projectData.projectCadastralRecords.cadastralRecords.map(
  //         (item: any) => item.cadastralNumber
  //       );
  //     const predialData = await getPolygonByCadastralNumber(
  //       cadastralNumbersArray
  //     ); // Llamada a la función getData
  //     console.log('predialData', predialData);
  //     setPolygonsFetchedData(predialData);
  //   }

  //   console.log("projectData", projectData)

  //   updatePredialData();
  // }, [projectData]);

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
  const totalProjectTokens = periods.reduce(
    (sum: number, item: any) => sum + parseInt(item.amount),
    0
  );
  const totalTokensSold = project.transactions.items.reduce(
    (acc: any, item: any) => {
      return acc + item.amountOfTokens;
    },
    0
  );

  const totalTokensFromFirstToActualPeriod: number = tokenHistoricalData.reduce(
    (acc: any, hd: any) => {
      if (parseInt(hd.period) <= parseInt(actualPeriod?.period)) {
        return acc + hd.amount;
      } else {
        return acc;
      }
    },
    0
  );

  const tokenUnits: number = totalProjectTokens - parseInt(totalTokensSold);

  // const tokenUnits: number =
  //   parseInt(actualPeriod?.amount) - parseInt(totalTokensSold);

  const coordString: string =
    project.productFeatures.items.filter((item: any) => {
      return item.featureID === 'C_ubicacion';
    })[0]?.value || '4.708392839967101, -74.06997219191005';
  const coords = coordString.split(' ');
  const lat: number = parseFloat(coords[0]);
  const lng: number = parseFloat(coords[1]);

  const porcentageBuyed: number =
    (parseInt(totalTokensSold) * 100) / tokenUnits;
  const createdAt: any = new Date(project.createdAt);
  const updatedAt: any = new Date(project.updatedAt);

  const relevantInfo = {
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
    tokenUnits: availableTokenAmount,
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
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Encabezado */}
      <PageHeader imageURL={imageData} />
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-6 mt-5">
        <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
        <p className="text-gray-600 mt-2">{project.description}</p>

        {/* Información relevante */}
        <div className="mt-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Información Relevante
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <Card>
              <Card.Body>
                <h3 className="font-bold">Categoría</h3>
                <p>{project.category.name}</p>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <h3 className="font-bold">Fecha de Inscripción</h3>
                <p>{project.createdAt.split('-')[0]}</p>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Mapa */}
        <div className="mt-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Ubicación del Proyecto
          </h2>
          <div className="h-64 w-full rounded-lg overflow-hidden">
            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env['NEXT_PUBLIC_GMAPS_API_KEY'] || '',
              }}
              defaultCenter={{
                lat: projectData.projectInfo.location.coords.lat,
                lng: projectData.projectInfo.location.coords.lng,
              }}
              defaultZoom={12}
              onGoogleApiLoaded={({ map, maps }) => {
                console.log(
                  projectData.projectPredialGeoJson,
                  'polygonsFetchedData'
                );

                if (projectData?.projectPredialGeoJson?.features?.length > 0) {
                  // Load GeoJSON.
                  map.data.addGeoJson(projectData.projectPredialGeoJson);
                  console.log('entro');

                  // Create empty bounds object
                  const bounds = new maps.LatLngBounds();

                  map.data.addListener('click', (event: any) => {
                    const codigo = event.feature.getProperty('CODIGO');
                    console.log('Este es el codigo: ', codigo);
                    const contentString = `
                        <div class='infoWindowContainer'>
                          <p>Identificador catastral: ${codigo}</p>
                        </div>
                      `;

                    const infoWindow = new maps.InfoWindow({
                      content: contentString,
                      ariaLabel: codigo,
                    });
                    //setInfoWindow(infoWindow);
                    infoWindow.setPosition(event.latLng);
                    infoWindow.open(map, event.latLng);
                  });

                  map.data.forEach(function (feature: any) {
                    const geo = feature.getGeometry();

                    geo.forEachLatLng(function (LatLng: any) {
                      bounds.extend(LatLng);
                    });
                  });

                  map.fitBounds(bounds);
                }
              }}
              yesIWantToUseGoogleMapApiInternals
            ></GoogleMapReact>
          </div>
        </div>

        {/* Tokens disponibles */}
        <div className="mt-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Tokens Disponibles
          </h2>
          <div className="flex justify-center bg-amber-400 text-sm px-2.5 py-0.5 rounded border border-custom-dark">
            <p>
              Tokens disponibles para comprar:
              <span className="font-semibold">
                {availableTokenAmount
                  ? `${availableTokenAmount.toLocaleString('es-CO')} `
                  : '0'}
              </span>
            </p>
          </div>
        </div>

        {/* Tabs Financieros */}
        {/* <div className="mt-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Detalles Financieros
          </h2>
          <TabsComponents projectData={props.projectData} />
        </div> */}

        {/* Acciones */}
        <div className="mt-5">
          <h2 className="text-2xl font-semibold text-gray-800">Acciones</h2>
          <div className="flex flex-col space-y-2 mt-3">
            <Link
              href={`/projects/${project.id}/purchase`}
              className="flex justify-center bg-blue-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition"
            >
              Ir a comprar
            </Link>
            <button
              className="flex justify-center bg-gray-800 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-900 transition"
              onClick={() => router.push(`/projects/${project.id}/dashboard`)}
            >
              Dashboard del proyecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
Product.Layout = 'Main';

export async function getServerSideProps(context: any) {
  const { projectId } = context.params;

  const project = await getProject(projectId);
  const projectData = await getProjectData(projectId);
  console.log(projectData);
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
