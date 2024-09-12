import { getPolygonByCadastralNumber } from '@suan/backend';
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
  };
};
