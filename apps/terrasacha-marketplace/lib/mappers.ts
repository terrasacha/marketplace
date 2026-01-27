
import { getPolygonByCadastralNumber } from '@terrasacha/backend';
import {
  parseSerializedKoboData,
  convertAWSDatetimeToDate,
  getElapsedTime,
  capitalizeWords,
  getActualPeriod,
} from './util';

const moment = require('moment');
export const mapGeoData = async (validatorDocuments: any): Promise<any> => {
  const extensionesPermitidas = ['.kml', '.kmz'];

  const archivosFiltrados = validatorDocuments.filter((archivo: any) => {
    const filePath = archivo.filePathS3;
    const extension = filePath.slice(filePath.lastIndexOf('.'));

    return extensionesPermitidas.includes(extension);
  });

  return archivosFiltrados;
};

export const mapProjectVerifiers = async (data: any): Promise<string[]> => {
  const projectVerifiers = data.userProducts.items
    .filter((up: any) => up.user.role === 'validator')
    .map((userProduct: any) => {
      return userProduct.user.id;
    });

  return projectVerifiers;
};

// Importa los módulos necesarios según sea necesario
// Importa aquí tus funciones como convertAWSDatetimeToDate y getElapsedTime

export const mapProjectVerifiersNames = async (
  data: any
): Promise<string[]> => {
  const projectVerifiersNames = data.userProducts.items
    .filter((up: any) => up.user.role === 'validator')
    .map((userProduct: any) => {
      return userProduct.user.name;
    });

  return projectVerifiersNames;
};

export const mapVerificationsData = async (
  verifications: any
): Promise<any> => {
  if (verifications.length > 0) {
    const verificationData = verifications.map(async (verification: any) => {
      return {
        id: verification.id,
        verifierID: verification.userVerifierID || '',
        verifierName: verification.userVerifier?.name || '',
        postulantName: verification.userVerified?.name || '',
        postulantID: verification.userVerifiedID || '',
        messages: await Promise.all(
          verification.verificationComments.items
            .sort(function (a: any, b: any) {
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            })
            .map(async (msg: any) => {
              return {
                ...msg,
                userName: await capitalizeWords(
                  msg.isCommentByVerifier
                    ? verification.userVerifier.name
                    : verification.userVerified.name
                ),
                createdAt: await convertAWSDatetimeToDate(msg.createdAt),
                elapsedTime: await getElapsedTime(msg.createdAt),
              };
            })
        ),
      };
    });

    // Esperar a que todas las promesas se resuelvan y devolver la primera
    const resolvedVerificationData = await Promise.all(verificationData);

    return resolvedVerificationData[0];
  }

  return {};
};

export const mapDocumentsData = async (data: any): Promise<any[]> => {
  const PFNameMapper: Record<string, string> = {
    B_owner_certificado: 'Certificado de tradición',
    C_plano_predio: 'Plano del predio',
  };
  const verifiablePF = data.productFeatures.items.filter(
    (pf: any) => pf.feature.isVerifable === true
  );

  const documentsPromises = verifiablePF.map((pf: any) =>
    pf.documents.items
      .filter((document: any) => document.status !== 'validatorFile')
      .map(async (document: any) => {
        return {
          id: document.id,
          pfID: pf.id,
          title: PFNameMapper[pf.feature.name],
          url: document.url,
          signed: document.signed,
          signedHash: document.signedHash,
          isUploadedToBlockChain: document.isUploadedToBlockChain,
          isApproved: document.isApproved,
          verification: await mapVerificationsData(pf.verifications.items),
          updatedAt: await convertAWSDatetimeToDate(pf.updatedAt),
          status: document.status,
        };
      })
  );
  const documents = await Promise.all(documentsPromises.flat());
  return documents;
};

export const mapLocationData = async (
  location: string | null
): Promise<any> => {
  if (!location) {
    return {
      lat: '',
      lng: '',
      alt: '',
      pres: '',
    };
  }

  const [lat, lng, alt, pres] = location.split(' ').map(parseFloat);

  return {
    lat: isNaN(lat) ? '' : lat,
    lng: isNaN(lng) ? '' : lng,
    alt: isNaN(alt) ? '' : alt,
    pres: isNaN(pres) ? '' : pres,
  };
};

export const mapStatus = async (obj: string): Promise<string | boolean> => {
  const mapper: Record<string, string> = {
    draft: 'En borrador',
    verified: 'Verificado',
    on_verification: 'En verificación',
    in_blockchain: 'En blockchain',
    in_equilibrium: 'En equilibrio',
  };

  return mapper[obj] || false;
};

export const mapCategory = async (obj: string): Promise<string | boolean> => {
  const mapper: Record<string, string> = {
    PROYECTO_PLANTACIONES: 'Proyecto Plantaciones',
    'REDD+': 'REDD+',
    'MIXTO': 'MIXTO',
    'ECOSISTEMAS_ESTRATÉGICOS': 'ECOSISTEMAS_ESTRATÉGICOS'


  };

  return mapper[obj] || false;
};

export const mapUseTypes = async (
  types: string[] | string | null
): Promise<string[] | boolean> => {
  const mapper: Record<string, string> = {
    potreros: 'Potreros',
    plantaciones_forestales1: 'Plantaciones Forestales 1',
    plantaciones_forestales2: 'Plantaciones Forestales 2',
    plantaciones_forestales3: 'Plantaciones Forestales 3',
    frutales1: 'Frutales 1',
    frutales2: 'Frutales 2',
    otros: 'Otros',
  };

  if (Array.isArray(types)) {
    const mappedData = types.map((type) => mapper[type]);
    return mappedData;
  }

  return false;
};

export const mapTrueOrFalseAnswers = async (
  answer: string
): Promise<string | boolean> => {
  const mapper: Record<string, string> = {
    yes: 'Si',
    no: 'No',
  };

  return mapper[answer] || false;
};

export const mapTemporalOrPermanent = async (
  answer: string
): Promise<string | boolean> => {
  const mapper: Record<string, string> = {
    temporal: 'Temporal',
    permanente: 'Permanente',
  };

  return mapper[answer] || false;
};
// Importa aquí tus funciones como parseSerializedKoboData, mapTrueOrFalseAnswers, mapTemporalOrPermanent y mapUseTypes
const timeBetweenDates = (firstPeriod: any, lastPeriod: any) => {
  let startDate = moment(firstPeriod, 'DD-MM-YYYY');
  let endDate = moment(lastPeriod, 'DD-MM-YYYY');

  let totalMonths = endDate.diff(startDate, 'months');
  let years = Math.floor(totalMonths / 12);
  let months = totalMonths % 12;

  let daysInLastMonth = endDate.diff(
    startDate.add(years, 'years').add(months, 'months'),
    'days'
  );
  return { years, months, days: daysInLastMonth };
};
const mapProjectGeneralAspects = async (data: any): Promise<any> => {
  let parsedData: any = '';
  if (data) {
    parsedData = await parseSerializedKoboData(data);
  }

  return {
    postulant: {
      livesOnProperty:
        (await mapTrueOrFalseAnswers(parsedData?.G_habita_predio)) || '',
      timeLivingOnProperty: parsedData?.G_habita_years || '',
      typeOfStay:
        (await mapTemporalOrPermanent(parsedData?.G_Temporal_permanente)) || '',
    },
    households: parsedData?.G_viviendas_number || '',
    familiesNumber: parsedData?.G_familias || '',
    membersPerFamily: parsedData?.G_familias_miembros || '',
    roadsStatus: parsedData?.G_vias_state || '',
    municipalDistance: parsedData?.G_distancia_predio_municipal || '',
    conveyance: parsedData?.G_transport_mean || '',
    neighborhoodRoads:
      (await mapTrueOrFalseAnswers(parsedData?.G_caminos_existence)) || '',
    collapseRisk: parsedData?.G_risks_erosion_derrumbe || '',
  };
};

const mapProjectEcosystems = async (data: any): Promise<any> => {
  let parsedData: any = '';
  if (data) {
    parsedData = await parseSerializedKoboData(data);
  }

  return {
    waterSprings: {
      exist: (await mapTrueOrFalseAnswers(parsedData?.F_nacimiento_agua)) || '',
      quantity: parsedData?.F_nacimiento_agua_quantity || '',
    },
    concessions: {
      exist: (await mapTrueOrFalseAnswers(parsedData?.F_agua_concede)) || '',
      entity: parsedData?.F_agua_concede_entity || '',
    },
    deforestationThreats: parsedData?.F_amenazas_defo_desc || '',
    conservationProjects: parsedData?.F_conservacion_desc || '',
    diversity: {
      fauna: parsedData?.F_especies_fauna || '',
      flora: parsedData?.F_especies_flora || '',
      mammals: parsedData?.F_especies_mamiferos || '',
      birds: parsedData?.F_especies_aves || '',
    },
  };
};

const mapProjectUses = async (data: any): Promise<any> => {
  let parsedData: any = '';
  if (data) {
    parsedData = await parseSerializedKoboData(data);
  }

  return {
    actualUse: {
      types: (await mapUseTypes(parsedData?.D_actual_use)) || [],
      potreros: {
        ha: parsedData?.D_area_potrero || '',
      },
      plantacionesForestales1: {
        especie: parsedData?.D_especie_plantaciones1 || '',
        ha: parsedData?.D_ha_plantaciones1 || '',
      },
      plantacionesForestales2: {
        especie: parsedData?.D_especie_plantaciones2 || '',
        ha: parsedData?.D_ha_plantaciones2 || '',
      },
      plantacionesForestales3: {
        especie: parsedData?.D_especie_plantaciones3 || '',
        ha: parsedData?.D_ha_plantaciones3 || '',
      },
      frutales1: {
        especie: parsedData?.D_especie_frutales1 || '',
        ha: parsedData?.D_ha_frutales1 || '',
      },
      frutales2: {
        especie: parsedData?.D_especie_frutales2 || '',
        ha: parsedData?.D_ha_frutales2 || '',
      },
      otros: {
        especie: parsedData?.D_especie_otros || '',
        ha: parsedData?.D_ha_otros || '',
      },
    },
    replaceUse: {
      types: (await mapUseTypes(parsedData?.D_replace_use)) || [],
      potreros: {
        newUse: parsedData?.D_replace_potrero_use || '',
        ha: parsedData?.D_replace_ha_potrero_use || '',
      },
      plantacionesForestales1: {
        newUse: parsedData?.D_replace_plantaciones1_use || '',
        ha: parsedData?.D_replace_ha_plantaciones1_use || '',
      },
      plantacionesForestales2: {
        newUse: parsedData?.D_replace_plantaciones2_use || '',
        ha: parsedData?.D_replace_ha_plantaciones2_use || '',
      },
      plantacionesForestales3: {
        newUse: parsedData?.D_replace_plantaciones3_use || '',
        ha: parsedData?.D_replace_ha_plantaciones3_use || '',
      },
      frutales1: {
        newUse: parsedData?.D_replace_frutales1_use || '',
        ha: parsedData?.D_replace_ha_frutales1_use || '',
      },
      frutales2: {
        newUse: parsedData?.D_replace_frutales2_use || '',
        ha: parsedData?.D_replace_ha_frutales2_use || '',
      },
      otros: {
        newUse: parsedData?.D_replace_otros_use || '',
        ha: parsedData?.D_replace_ha_otros_use || '',
      },
    },
  };
};

export const mapProjectData = async (data: any): Promise<any> => {
  const projectID: string = data.id;
  const projecIsActive: boolean = data.isActive;

  const tokenName: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_NAME';
    })[0]?.value || '';
  const tokenCurrency: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
    })[0]?.value || '';
  const pfTokenNameID: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_NAME';
    })[0]?.id || '';

  const pfTokenPriceID: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_PRICE';
    })[0]?.id || '';

  const pfTokenAmountID: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_AMOUNT_OF_TOKENS';
    })[0]?.id || '';

  const pfTokenHistoricalDataID: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
    })[0]?.id || '';

  const tokenHistoricalData: any[] = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
    })[0]?.value || '[]'
  );

  const periods: any[] = tokenHistoricalData.map((tkhd: any) => {
    return {
      period: tkhd.period,
      date: new Date(tkhd.date),
      price: tkhd.price,
      amount: tkhd.amount,
    };
  });
  const lifeTimeProject: any = timeBetweenDates(
    periods[0].date,
    periods[periods.length - 1].date
  );
  const actualPeriod: any = await getActualPeriod(Date.now(), periods);

  const pfProjectValidatorDocumentsID: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_PROJECT_VALIDATOR_FILES';
    })[0]?.id || '';

  const projectValidatorDocuments: any[] = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_PROJECT_VALIDATOR_FILES';
    })[0]?.value || '[]'
  );
  const productsOfCycleProject: any[] = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_PRODUCTOS_DEL_CICLO_DE_PROYECTO';
    })[0]?.value || '[]'
  );
  const revenuesByProduct: any[] = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_INGRESOS_POR_PRODUCTO';
    })[0]?.value || '[]'
  );
  const cashFlowResume: any[] = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_RESUMEN_FLUJO_DE_CAJA';
    })[0]?.value || '[]'
  );

  const financialIndicators = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_INDICADORES_FINANCIEROS';
    })[0]?.value || '[]'
  );

  const financialIndicatorsID =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'GLOBAL_INDICADORES_FINANCIEROS';
    })[0]?.id || null;

  // A
  const postulantName: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_postulante_name';
    })[0]?.value || '';
  const postulantDocType: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_postulante_doctype';
    })[0]?.value || '';
  const postulantDocNumber: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_postulante_id';
    })[0]?.value || '';
  const postulantEmail: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_postulante_email';
    })[0]?.value || '';
  const vereda: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_vereda';
    })[0]?.value || '';
  const municipio: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_municipio';
    })[0]?.value || '';
  const matricula: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_matricula';
    })[0]?.value || '';
  const fichaCatrastal: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_ficha_catastral';
    })[0]?.value || '';

  // B
  const ownerName: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'B_owner';
    })[0]?.value || '';
  const ownerDocType: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'B_owner_doctype';
    })[0]?.value || '';
  const ownerDocNumber: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'B_owner_id';
    })[0]?.value || '';

  // C
  const location: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'C_ubicacion';
    })[0]?.value || '';

  // D
  const area: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'D_area';
    })[0]?.value || '0';
  const projectUses: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'D_actual_use';
    })[0]?.value || '';

  // E
  const restrictionsDesc: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'E_restriccion_desc';
    })[0]?.value || '';

  const restrictionsOther: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'E_resctriccion_other';
    })[0]?.value || '';

  // F
  const projectEcosystem: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'F_nacimiento_agua';
    })[0]?.value || '';

  // G
  const propertyGeneralAspects: string =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'G_habita_predio';
    })[0]?.value || '';

  // H
  const technicalAssistance: string =
    data.productFeatures.items.filter(
      (item: any) => item.featureID === 'H_asistance_desc'
    )[0]?.value || '';

  const strategicAllies: string =
    data.productFeatures.items.filter(
      (item: any) => item.featureID === 'H_aliados_estrategicos_desc'
    )[0]?.value || '';

  const communityGroups: string =
    data.productFeatures.items.filter(
      (item: any) => item.featureID === 'H_grupo_comunitario_desc'
    )[0]?.value || '';

  const postulantID: string =
    data.userProducts.items.filter(
      (up: any) => up.user?.role === 'constructor'
    )[0]?.user.id || '';

  const pfOwnersDataID =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'B_owners';
    })[0]?.id || '';

  const ownersData = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'B_owners';
    })[0]?.value || '[]'
  );

  // Cadsatral Data
  const pfCadastralDataID =
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_predio_ficha_catastral';
    })[0]?.id || '';

  const cadastralData = JSON.parse(
    data.productFeatures.items.filter((item: any) => {
      return item.featureID === 'A_predio_ficha_catastral';
    })[0]?.value || '[]'
  );

  // geo json
  const cadastralNumbersArray = cadastralData.map(
    (item: any) => item.cadastralNumber
  );
  const geoJsonPredialData = await getPolygonByCadastralNumber(
    cadastralNumbersArray
  );

  return {
    projectInfo: {
      id: projectID,
      status: await mapStatus(data.status),
      isActive: projecIsActive,
      title: data.name,
      description: data.description,
      category: await mapCategory(data.categoryID),
      area: area,
      token: {
        pfIDs: {
          pfTokenNameID: pfTokenNameID,
          pfTokenPriceID: pfTokenPriceID,
          pfTokenAmountID: pfTokenAmountID,
          pfTokenHistoricalDataID: pfTokenHistoricalDataID,
        },
        historicalData: tokenHistoricalData,
        transactionsNumber: data.transactions.items.length,
        name: tokenName,
        actualPeriod: actualPeriod?.period || 'unknown',
        actualPeriodTokenPrice: actualPeriod?.price || '',
        lifeTimeProject: lifeTimeProject || 'unknown',
        currency: tokenCurrency,
        actualPeriodTokenAmount: actualPeriod?.amount || '',
      },
      location: {
        vereda: vereda,
        municipio: municipio,
        matricula: matricula,
        fichaCatrastal: fichaCatrastal,
        coords: await mapLocationData(location),
      },
      verificationLimitDate: data.timeOnVerification,
      createdAt: await convertAWSDatetimeToDate(data.createdAt),
    },
    projectPostulant: {
      id: postulantID,
      name: postulantName,
      docType: postulantDocType.toUpperCase(),
      docNumber: postulantDocNumber,
      email: postulantEmail,
    },
    projectOwner: {
      name: ownerName,
      docType: ownerDocType.toUpperCase(),
      docNumber: ownerDocNumber,
    },
    projectOwners: {
      pfID: pfOwnersDataID,
      owners: ownersData,
    },
    projectCadastralRecords: {
      pfID: pfCadastralDataID,
      cadastralRecords: cadastralData,
    },
    projectUses: await mapProjectUses(projectUses),
    projectRestrictions: {
      desc: restrictionsDesc,
      other: restrictionsOther,
    },
    projectEcosystem: await mapProjectEcosystems(projectEcosystem),
    projectGeneralAspects: await mapProjectGeneralAspects(
      propertyGeneralAspects
    ),
    projectRelations: {
      technicalAssistance: technicalAssistance,
      strategicAllies: strategicAllies,
      communityGroups: communityGroups,
    },
    projectFiles: await mapDocumentsData(data),
    projectFilesValidators: {
      pfProjectValidatorDocumentsID: pfProjectValidatorDocumentsID,
      projectValidatorDocuments: projectValidatorDocuments,
    },
    projectVerifiers: await mapProjectVerifiers(data),
    projectVerifierNames: await mapProjectVerifiersNames(data),
    projectGeoData: await mapGeoData(projectValidatorDocuments),
    projectFinancialInfo: {
      revenuesByProduct: revenuesByProduct,
      projectProductByCycle: productsOfCycleProject,
      cashFlowResume: cashFlowResume,
      financialIndicators: { financialIndicatorsID, financialIndicators },
    },
    projectPredialGeoJson: geoJsonPredialData,
    projectProperties: data.properties?.items || [],
  };
};

// Mapper para transformar productos de GraphQL a la interface Project para MockupProjectsList
export const mapProductToProjectInterface = async (product: any): Promise<any> => {
  try {
    const productFeatures = product.productFeatures?.items || [];
    
    // Información básica
    const id = product.id || '';
    const title = product.name || '';
    const description = product.description || '';
    const categoryID = product.categoryID || '';
    const category = product.category?.name || (await mapCategory(categoryID)) || categoryID;
    const status = product.status || '';
    const isActive = product.isActive || false;
    const isActiveOnPlatform = product.isActiveOnPlatform ?? true;
    const projectReadiness = product.projectReadiness || 0;
    const tokenGenesis = product.tokenGenesis ?? false; // true = tokens verdes, false = tokens grises

    // Información de ubicación
    const municipio = productFeatures.find((pf: any) => pf.featureID === 'A_municipio')?.value || '';
    const vereda = productFeatures.find((pf: any) => pf.featureID === 'A_vereda')?.value || '';
    const department = product.properties?.items?.[0]?.department || '';
    const location = municipio && department ? `${municipio}, ${department}` : municipio || department || '';

    // Información de imágenes
    const firstImage = product.images?.items?.[0];
    let imageUrl = '/images/home-page/image.png'; // Imagen por defecto
    if (firstImage?.imageURL) {
      // Construir URL de S3
      const imagePath = firstImage.imageURL;
      if (imagePath.includes('http')) {
        imageUrl = imagePath;
      } else {
        // Si no es URL completa, construirla con el endpoint de S3
        const s3Endpoint = (process.env.NEXT_PUBLIC_s3EndPoint || '').endsWith('/') 
          ? process.env.NEXT_PUBLIC_s3EndPoint 
          : `${process.env.NEXT_PUBLIC_s3EndPoint}/`;
        if (imagePath.startsWith('public/')) {
          imageUrl = `${s3Endpoint}${imagePath}`;
        } else {
          imageUrl = `${s3Endpoint}public/${imagePath}`;
        }
      }
    }

    // Información de tokens
    const tokenNameFeature = productFeatures.find((pf: any) => pf.featureID === 'GLOBAL_TOKEN_NAME');
    const tokenName = tokenNameFeature?.value || product.name?.replace('Proyecto - ', '') || '';
    const tokenCurrency = productFeatures.find((pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY')?.value || 'USD';

    // Total de tokens - Usar GLOBAL_TOKEN_TOTAL_AMOUNT si existe, sino calcular desde historical data
    const tokenTotalAmountFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_TOTAL_AMOUNT'
    );
    let totalTokens = tokenTotalAmountFeature?.value 
      ? parseInt(tokenTotalAmountFeature.value) 
      : 0;

    // Token Historical Data - para precio actual y TIR
    const tokenHistoricalDataFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
    );
    let price = 0;
    let tir = 0; // TIR del período actual
    
    if (tokenHistoricalDataFeature?.value) {
      try {
        const tokenHistoricalData = JSON.parse(tokenHistoricalDataFeature.value);
        
        // Si no hay GLOBAL_TOKEN_TOTAL_AMOUNT, calcular desde historical data
        if (!totalTokens) {
          totalTokens = tokenHistoricalData.reduce(
            (sum: number, item: any) => sum + parseInt(item.amount || 0),
            0
          );
        }

        // Obtener precio y TIR del período actual
        const periods = tokenHistoricalData.map((tkhd: any) => ({
          period: tkhd.period,
          date: new Date(tkhd.date),
          price: parseFloat(tkhd.price || 0),
          amount: parseInt(tkhd.amount || 0),
          tir: parseFloat(tkhd.tir || 0),
        }));

        const actualPeriod = await getActualPeriod(Date.now(), periods);
        price = actualPeriod?.price || 0;
        tir = actualPeriod?.tir || 0;
      } catch (error) {
        // Error parsing GLOBAL_TOKEN_HISTORICAL_DATA
      }
    }

    // Token Amount Distribution - extraer tokens del INVERSIONISTA
    const tokenAmountDistributionFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
    );
    let investorTokens = 0; // Tokens asignados al inversionista (meta de venta)
    let soldTokens = 0; // Tokens vendidos (transacciones)
    
    if (tokenAmountDistributionFeature?.value) {
      try {
        const distributionData = JSON.parse(tokenAmountDistributionFeature.value);
        // Buscar específicamente los tokens del INVERSIONISTA
        const investorDistribution = distributionData.find(
          (item: any) => item.CONCEPTO === 'INVERSIONISTA'
        );
        investorTokens = parseInt(investorDistribution?.CANTIDAD || 0);
      } catch (error) {
        // Error parsing GLOBAL_TOKEN_AMOUNT_DISTRIBUTION
      }
    }

    // Calcular tokens vendidos desde transacciones
    if (product.transactions?.items) {
      soldTokens = product.transactions.items.reduce(
        (sum: number, tx: any) => sum + (parseInt(tx.amountOfTokens) || 0),
        0
      );
    }

    // Tokens disponibles para venta = tokens del inversionista - tokens vendidos
    const availableTokens = Math.max(0, investorTokens - soldTokens);

    // Calcular progreso de venta (vendidos / meta del inversionista)
    const progress = investorTokens > 0 ? Math.round((soldTokens / investorTokens) * 100) : 0;

    // ROI/TIR - Usar el TIR del período actual desde GLOBAL_TOKEN_HISTORICAL_DATA
    const roi = tir;

    // Información de campaña (opcional)
    const campaignID = product.campaignID || null;
    const campaignName = product.campaign?.name || null;

    // Fechas
    const createdAt = product.createdAt || '';
    const updatedAt = product.updatedAt || '';

    return {
      id,
      title,
      description,
      category,
      categoryID,
      location,
      municipio,
      vereda,
      department,
      imageUrl,
      status,
      isActive,
      isActiveOnPlatform,
      price,
      availableTokens,
      totalTokens,
      investorTokens, // Meta de venta (tokens del inversionista)
      soldTokens, // Tokens vendidos
      roi,
      tokenName,
      tokenCurrency,
      progress,
      projectReadiness,
      tokenGenesis,
      campaignID,
      campaignName,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    // Error mapping product to Project interface
    // Retornar objeto con valores por defecto en caso de error
    return {
      id: product.id || '',
      title: product.name || 'Proyecto sin nombre',
      description: product.description || '',
      category: product.category?.name || '',
      categoryID: product.categoryID || '',
      location: '',
      municipio: '',
      vereda: '',
      department: '',
      imageUrl: '/images/home-page/image.png',
      status: product.status || '',
      isActive: product.isActive || false,
      isActiveOnPlatform: product.isActiveOnPlatform ?? true,
      price: 0,
      availableTokens: 0,
      totalTokens: 0,
      investorTokens: 0,
      soldTokens: 0,
      roi: 0,
      tokenName: '',
      tokenCurrency: 'USD',
      progress: 0,
      projectReadiness: product.projectReadiness || 0,
      tokenGenesis: product.tokenGenesis ?? false,
      campaignID: null,
      campaignName: null,
      createdAt: product.createdAt || '',
      updatedAt: product.updatedAt || '',
    };
  }
};

// Mapper para transformar productos de GraphQL a la interface ProjectDetailData para MockupProjectDetail
export const mapProductToProjectDetailData = async (product: any): Promise<any> => {
  try {
    const productFeatures = product.productFeatures?.items || [];
    
    // Información básica
    const id = product.id || '';
    const name = product.name || '';
    const description = product.description || '';
    const categoryID = product.categoryID || '';
    const categoryName = product.category?.name || (await mapCategory(categoryID)) || categoryID;
    const status = product.status || '';
    const tokenGenesis = product.tokenGenesis ?? false;

    // Información de ubicación
    const municipio = productFeatures.find((pf: any) => pf.featureID === 'A_municipio')?.value || '';
    const vereda = productFeatures.find((pf: any) => pf.featureID === 'A_vereda')?.value || '';
    const department = product.properties?.items?.[0]?.department || '';
    const location = productFeatures.find((pf: any) => pf.featureID === 'C_ubicacion')?.value || '';

    // Información de imágenes
    const firstImage = product.images?.items?.[0];
    let imageUrl = '/images/home-page/image.png'; // Imagen por defecto
    if (firstImage?.imageURL) {
      const imagePath = firstImage.imageURL;
      if (imagePath.includes('http')) {
        imageUrl = imagePath;
      } else {
        // Si no es URL completa, construirla con el endpoint de S3
        const s3Endpoint = (process.env.NEXT_PUBLIC_s3EndPoint || '').endsWith('/') 
          ? process.env.NEXT_PUBLIC_s3EndPoint 
          : `${process.env.NEXT_PUBLIC_s3EndPoint}/`;
        if (imagePath.startsWith('public/')) {
          imageUrl = `${s3Endpoint}${imagePath}`;
        } else {
          imageUrl = `${s3Endpoint}public/${imagePath}`;
        }
      }
    }

    // Información de tokens
    const tokenNameFeature = productFeatures.find((pf: any) => pf.featureID === 'GLOBAL_TOKEN_NAME');
    const tokenName = tokenNameFeature?.value || product.name?.replace('Proyecto - ', '') || '';
    const tokenCurrency = productFeatures.find((pf: any) => pf.featureID === 'GLOBAL_TOKEN_CURRENCY')?.value || 'USD';

    // Información de certificación
    const projectValidatorFilesFeature = productFeatures.find(
      (pf: any) => pf.featureID === 'GLOBAL_PROJECT_VALIDATOR_FILES'
    );
    let hasCertificate = false;
    if (projectValidatorFilesFeature?.value) {
      try {
        const validatorFiles = JSON.parse(projectValidatorFilesFeature.value);
        hasCertificate = Array.isArray(validatorFiles) && validatorFiles.length > 0;
      } catch (error) {
        // Error parsing GLOBAL_PROJECT_VALIDATOR_FILES
      }
    }

    // Información del postulante
    const postulantName = productFeatures.find((pf: any) => pf.featureID === 'A_postulante_name')?.value || '';

    return {
      id,
      name,
      description,
      categoryID,
      categoryName,
      status,
      tokenGenesis,
      municipio,
      vereda,
      department,
      location,
      imageUrl,
      tokenName,
      tokenCurrency,
      hasCertificate,
      postulantName,
    };
  } catch (error) {
    // Error mapping product to ProjectDetailData interface
    // Retornar objeto con valores por defecto en caso de error
    return {
      id: product.id || '',
      name: product.name || 'Proyecto sin nombre',
      description: product.description || '',
      categoryID: product.categoryID || '',
      categoryName: product.category?.name || '',
      status: product.status || '',
      tokenGenesis: product.tokenGenesis ?? false,
      municipio: '',
      vereda: '',
      department: '',
      location: '',
      imageUrl: '/images/home-page/image.png',
      tokenName: '',
      tokenCurrency: 'USD',
      hasCertificate: false,
      postulantName: '',
    };
  }
};