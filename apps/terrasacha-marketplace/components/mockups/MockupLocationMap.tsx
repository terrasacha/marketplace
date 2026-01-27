'use client';
import { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import { 
  getPolygonByCadastralNumber, 
  getPredialDataByCadastralNumber, 
  getPredialData2ByCadastralNumber 
} from '@terrasacha/backend';

interface LocationData {
  location: string;
  municipio: string;
  vereda: string;
  department: string;
}

interface MockupLocationMapProps {
  project?: any;
}

const MockupLocationMap = ({ project }: MockupLocationMapProps) => {
  const [polygonData, setPolygonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);

  let locationData: LocationData | null = null;

  // Obtener datos reales del proyecto
  if (project?.productFeatures?.items) {
    const productFeatures = project.productFeatures.items;

    const municipio = productFeatures.find(
      (pf: any) => pf.featureID === 'A_municipio'
    )?.value || '';

    const vereda = productFeatures.find(
      (pf: any) => pf.featureID === 'A_vereda'
    )?.value || '';

    const department = project.properties?.items?.[0]?.department || '';

    const location = productFeatures.find(
      (pf: any) => pf.featureID === 'C_ubicacion'
    )?.value || '';

    if (location || municipio || vereda) {
      locationData = {
        location,
        municipio,
        vereda,
        department,
      };
    }
  }

  // Obtener números catastrales de las propiedades
  const getCadastralNumbers = (): string[] => {
    if (!project?.properties?.items) return [];

    const cadastralNumbers: string[] = [];

    project.properties.items.forEach((property: any) => {
      const cadastralFeature = property.propertyFeatures?.items?.find(
        (item: any) => item.featureID === 'A_predio_ficha_catastral'
      );

      if (cadastralFeature?.value) {
        try {
          const parsed = JSON.parse(cadastralFeature.value);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item.cadastralNumber) {
                cadastralNumbers.push(item.cadastralNumber);
              }
            });
          }
        } catch (e) {
          // Error parsing cadastral data
        }
      }
    });

    return cadastralNumbers;
  };

  // Cargar polígonos con datos prediales enriquecidos
  useEffect(() => {
    const loadPolygons = async () => {
      const cadastralNumbers = getCadastralNumbers();

      if (cadastralNumbers.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Obtener polígonos y datos prediales en paralelo
        const [geoJsonData, predialData, predialData2] = await Promise.all([
          getPolygonByCadastralNumber(cadastralNumbers),
          getPredialDataByCadastralNumber(cadastralNumbers),
          getPredialData2ByCadastralNumber(cadastralNumbers),
        ]);

        if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
          // Enriquecer features con datos prediales
          geoJsonData.features = geoJsonData.features.map((feature: any) => {
            const codigo = feature.properties.CODIGO;
            return {
              ...feature,
              properties: {
                ...feature.properties,
                ...predialData[codigo],
                ...predialData2[codigo],
              },
            };
          });

          setPolygonData(geoJsonData);
          setMapKey(prev => prev + 1);
        }
      } catch (error) {
        // Error fetching polygon data
      } finally {
        setLoading(false);
      }
    };

    loadPolygons();
  }, [project]);

  // Parsear coordenadas desde C_ubicacion (formato: "lat, lng 0 0" o "lat lng 0 0")
  const parseLocation = (locationString: string) => {
    if (!locationString) return { lat: 4.5709, lng: -74.2973 }; // Centro de Colombia
    // Limpiar comas y dividir por espacios
    const cleaned = locationString.replace(/,/g, '');
    const parts = cleaned.split(' ').filter(p => p.trim() !== '');
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return {
      lat: isNaN(lat) ? 4.5709 : lat,
      lng: isNaN(lng) ? -74.2973 : lng,
    };
  };

  const defaultCenter = locationData?.location
    ? parseLocation(locationData.location)
    : { lat: 4.5709, lng: -74.2973 };

  const fullLocation = locationData?.vereda && locationData?.municipio && locationData?.department
    ? `${locationData.vereda}, ${locationData.municipio}, ${locationData.department}`
    : locationData?.municipio && locationData?.department
    ? `${locationData.municipio}, ${locationData.department}`
    : locationData?.municipio || locationData?.department 
    || (locationData?.location ? `Coordenadas: ${defaultCenter.lat.toFixed(4)}, ${defaultCenter.lng.toFixed(4)}` : 'Ubicación no disponible');

  // Handler cuando se carga la API de Google Maps
  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    if (!polygonData || !polygonData.features) return;

    // Agregar GeoJSON al mapa
    map.data.addGeoJson(polygonData);

    // Estilo de los polígonos
    map.data.setStyle({
      fillColor: '#6e6c35',
      fillOpacity: 0.4,
      strokeColor: '#44482c',
      strokeWeight: 2,
    });

    // Calcular bounds para ajustar el zoom
    const bounds = new maps.LatLngBounds();
    map.data.forEach((feature: any) => {
      const geometry = feature.getGeometry();
      geometry.forEachLatLng((latLng: any) => {
        bounds.extend(latLng);
      });
    });

    // Ajustar el mapa a los bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      
      // Calcular centro
      const center = bounds.getCenter();
      setCenterCoords({ lat: center.lat(), lng: center.lng() });
    }

    // Info window al hacer clic en un polígono
    const infoWindow = new maps.InfoWindow();

    map.data.addListener('click', (event: any) => {
      const feature = event.feature;
      const codigo = feature.getProperty('CODIGO');
      const direccion = feature.getProperty('DIRECCION') || feature.getProperty('predio') || 'N/A';
      const departamento = feature.getProperty('NOMBRE_DEPARTAMENTO') || feature.getProperty('DEPARTAMENTO') || 'N/A';
      const municipio = feature.getProperty('NOMBRE_MUNICIPIO') || feature.getProperty('MUNICIPIO') || 'N/A';
      const destino = feature.getProperty('NOMBRE_DESTINOECONOMICO') || feature.getProperty('DESTINO_EC') || 'N/A';
      const descripcionDestino = feature.getProperty('DESCRIPCION_DESTINOECONOMICO') || '';
      const areaTerreno = feature.getProperty('AREA_TERRENO') || feature.getProperty('AREA_TERRE') || 0;
      const areaConstruida = feature.getProperty('AREA_CONSTRUIDA') || feature.getProperty('AREA_CONST') || 0;

      const content = `
        <div style="font-family: 'Jost', sans-serif; padding: 8px; max-width: 300px;">
          <p style="margin: 0 0 8px 0; font-weight: 500; color: #333;">${direccion}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Identificador catastral: ${codigo}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Departamento: ${departamento}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Municipio: ${municipio}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Destino económico: ${destino}${descripcionDestino ? ` (${descripcionDestino})` : ''}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Área de terreno: ${parseFloat(areaTerreno).toLocaleString('es-ES')} m²</p>
          <p style="margin: 0; font-size: 12px; color: #666;">Área construida: ${parseFloat(areaConstruida).toLocaleString('es-ES')} m²</p>
        </div>
      `;
      infoWindow.setContent(content);
      infoWindow.setPosition(event.latLng);
      infoWindow.open(map);
    });

    // Hover effects
    map.data.addListener('mouseover', (event: any) => {
      map.data.overrideStyle(event.feature, {
        fillOpacity: 0.6,
        strokeWeight: 3,
      });
    });

    map.data.addListener('mouseout', () => {
      map.data.revertStyle();
    });
  };

  // Si no hay datos de ubicación ni polígonos posibles, no mostrar
  if (!locationData && !project?.properties?.items?.length) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-scale-in group">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></div>
        <h3 className="text-xl font-jostBold text-custom-dark">
          Ubicación Geográfica
        </h3>
      </div>

      <div className="h-[400px] w-full rounded-xl overflow-hidden mb-4 bg-gray-100 relative shadow-inner group-hover:shadow-lg transition-shadow duration-300">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-white font-jostRegular">Cargando mapa...</p>
            </div>
          </div>
        ) : null}
        
        <GoogleMapReact
          key={mapKey}
          bootstrapURLKeys={{
            key: process.env.NEXT_PUBLIC_GMAPS_API_KEY || '',
          }}
          defaultCenter={defaultCenter}
          defaultZoom={6}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={handleApiLoaded}
          options={{
            mapTypeId: 'satellite',
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        />
      </div>

      {/* Información de ubicación */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-custom-marca-boton-alterno2/10 to-transparent">
        <svg
          className="w-5 h-5 text-custom-marca-boton flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm text-gray-700 font-jostRegular font-medium">
          {fullLocation}
        </p>
      </div>

      {/* Indicador de polígonos */}
      {polygonData && polygonData.features && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-[#6e6c35] opacity-60 rounded-sm border border-[#44482c]"></div>
          <span className="font-jostRegular">
            {polygonData.features.length} predio{polygonData.features.length > 1 ? 's' : ''} catastral{polygonData.features.length > 1 ? 'es' : ''} registrado{polygonData.features.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default MockupLocationMap;
