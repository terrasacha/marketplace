import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import MockupTokenEmission from './MockupTokenEmission';

// Interface basada en la estructura real de datos de la plataforma
interface ProjectDetailData {
  // Información básica
  id: string; // product.id
  name: string; // product.name
  description: string; // product.description
  categoryID: string; // product.categoryID
  categoryName: string; // product.category.name
  status: string; // product.status
  tokenGenesis: boolean; // product.tokenGenesis (determina si son tokens verdes o grises)
  
  // Información de ubicación
  municipio: string; // product.productFeatures.items[featureID === "A_municipio"].value
  vereda: string; // product.productFeatures.items[featureID === "A_vereda"].value
  department: string; // product.properties.items[0].department
  location: string; // product.productFeatures.items[featureID === "C_ubicacion"].value (coordenadas)
  
  // Información de imágenes
  imageUrl: string; // product.images.items[0].imageURL
  
  // Información de tokens
  tokenName: string; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_NAME"].value
  tokenCurrency: string; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_CURRENCY"].value
  
  // Información de certificación
  hasCertificate: boolean; // product.productFeatures.items[featureID === "GLOBAL_PROJECT_VALIDATOR_FILES"] (verificar si existe)
  
  // Información del postulante
  postulantName: string; // product.productFeatures.items[featureID === "A_postulante_name"].value
}

interface MockupProjectDetailProps {
  projectData: ProjectDetailData;
  project?: any;
  showEmissionTable?: boolean;
}

const MockupProjectDetail = ({ projectData, project, showEmissionTable = true }: MockupProjectDetailProps) => {

  // Estado activo: 'green' o 'gray' - Basado en tokenGenesis
  const [activeState] = useState<'green' | 'gray'>(projectData.tokenGenesis ? 'green' : 'gray');
  
  // Formatear ubicación completa
  const fullLocation = `${projectData.vereda}, ${projectData.municipio}, ${projectData.department}`;

  return (
    <div className="space-y-6">
      {/* Título y subtítulo */}
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-jostBold text-custom-dark mb-3 bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent">
          {projectData.name}
        </h1>
        <p className="text-lg text-gray-600 font-jostRegular mb-6 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-custom-marca-boton rounded-full animate-pulse"></span>
          {projectData.categoryName} - Cardano | {fullLocation}
        </p>

        {/* Botón de estado del proyecto y botón de compra */}
        <div className="flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            {activeState === 'green' && (
              <>
                <button
                  className="px-6 py-3 rounded-lg font-jostBold transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-105"
                  tabIndex={0}
                  aria-label="Tokens Verdes - Estado activo"
                  aria-pressed={true}
                >
                  <span className="relative z-10">Tokens Verdes</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                </button>
                <div className="relative group/tooltip">
                  <button
                    className="w-6 h-6 rounded-full bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-help"
                    tabIndex={0}
                    aria-label="Información sobre Tokens Verdes"
                  >
                    <span className="text-green-600 text-sm font-jostBold">!</span>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                    <h4 className="font-jostBold mb-2 text-green-400">Tokens Verdes</h4>
                    <p className="font-jostRegular leading-relaxed">
                      Los tokens verdes son los que cuentan directamente para la compensación de carbono. 
                      Se obtienen cuando el ente certificador certifica el proyecto y define la cantidad de 
                      tokens asociados al proyecto. Esta cantidad representa los tokens grises que se pueden 
                      convertir a tokens verdes.
                    </p>
                  </div>
                </div>
              </>
            )}
            {activeState === 'gray' && (
              <>
                <button
                  className="px-6 py-3 rounded-lg font-jostBold transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/50 scale-105"
                  tabIndex={0}
                  aria-label="Tokens Grises - Estado activo"
                  aria-pressed={true}
                >
                  <span className="relative z-10">Tokens Grises</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                </button>
                <div className="relative group/tooltip">
                  <button
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-help"
                    tabIndex={0}
                    aria-label="Información sobre Tokens Grises"
                  >
                    <span className="text-gray-700 text-sm font-jostBold">!</span>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                    <h4 className="font-jostBold mb-2 text-custom-marca-boton-alterno2">Tokens Grises</h4>
                    <p className="font-jostRegular leading-relaxed">
                      Cuando el proyecto distribuye tokens inicialmente, está distribuyendo tokens grises. 
                      Estos tokens grises en algún punto se pueden convertir a tokens verdes cuando el ente 
                      certificador certifica el proyecto y define la cantidad de tokens asociados al proyecto.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Botón de compra */}
          <Link
            href={`/projects/${projectData.id}/purchase`}
            className="group bg-gradient-to-r from-custom-marca-boton via-custom-marca-boton-variante2 to-custom-marca-boton hover:from-custom-marca-boton-variante hover:via-custom-marca-boton hover:to-custom-marca-boton-variante text-white font-jostBold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            tabIndex={0}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <svg
              className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="relative z-10">Comprar Tokens</span>
          </Link>
        </div>
      </div>

      {/* Imagen del proyecto */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl group animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-t from-custom-marca-boton/20 to-transparent z-10"></div>
        <Image
          src={projectData.imageUrl}
          alt={projectData.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
        />
        {projectData.hasCertificate && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <p className="text-sm font-jostBold text-custom-marca-boton">
                Certificado de Crédito de Carbono
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Descripción del proyecto */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></div>
          <h2 className="text-2xl font-jostBold text-custom-dark">
            Descripción del Proyecto
          </h2>
        </div>
        <p className="text-gray-700 leading-relaxed font-jostRegular text-lg">
          {projectData.description}
        </p>
      </div>

      {/* Tabla de Emisión de Tokens por Período */}
      {showEmissionTable && <MockupTokenEmission project={project} />}
    </div>
  );
};

export default MockupProjectDetail;

