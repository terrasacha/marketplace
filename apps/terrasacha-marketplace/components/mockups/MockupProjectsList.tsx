import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MockupHeader from './MockupHeader';
import MockupFooter from './MockupFooter';

// Interface basada en la estructura real de datos de la plataforma
interface Project {
  // Información básica del proyecto
  id: string; // product.id
  title: string; // product.name
  description: string; // product.description
  category: string; // product.categoryID o category.name
  categoryID: string; // product.categoryID
  location: string; // product.productFeatures.items[featureID === "A_municipio"] + ", " + department
  imageUrl: string; // product.images.items[0].imageURL
  status: string; // product.status (draft, verified, on_verification, in_blockchain, etc.)
  isActive: boolean; // product.isActive
  isActiveOnPlatform: boolean; // product.isActiveOnPlatform
  
  // Información de tokens
  price: number; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_HISTORICAL_DATA"][actualPeriod].price
  availableTokens: number; // investorTokens - soldTokens (tokens disponibles para venta)
  totalTokens: number; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_TOTAL_AMOUNT"].value
  investorTokens: number; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_AMOUNT_DISTRIBUTION"][INVERSIONISTA].CANTIDAD
  soldTokens: number; // suma de tokens vendidos (transacciones)
  roi: number; // product.productFeatures.items[featureID === "GLOBAL_INDICADORES_FINANCIEROS_TOKEN"][0].roi o similar
  tokenName: string; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_NAME"].value
  tokenCurrency: string; // product.productFeatures.items[featureID === "GLOBAL_TOKEN_CURRENCY"].value
  
  // Información de ubicación
  municipio: string; // product.productFeatures.items[featureID === "A_municipio"].value
  vereda: string; // product.productFeatures.items[featureID === "A_vereda"].value
  department: string; // properties.items[0].department
  
  // Información de progreso
  progress: number; // (soldTokens / investorTokens) * 100
  projectReadiness: number; // product.projectReadiness
  tokenGenesis: boolean; // product.tokenGenesis (true = token verde, false = token gris)
  
  // Información de campaña
  campaignID?: string; // product.campaignID
  campaignName?: string; // product.campaign.name
  
  // Fechas
  createdAt: string; // product.createdAt
  updatedAt: string; // product.updatedAt
}

interface MockupProjectsListProps {
  projects?: Project[];
}

const MockupProjectsList = ({ projects: projectsProp = [] }: MockupProjectsListProps) => {
  // Usar proyectos recibidos como props, o array vacío si no se proporcionan
  const [projects, setProjects] = useState<Project[]>(projectsProp);

  // Actualizar proyectos cuando cambien las props
  useEffect(() => {
    setProjects(projectsProp);
  }, [projectsProp]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'sale' | 'finished'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-custom-marca-boton-alterno/20 text-custom-marca-boton border border-custom-marca-boton/30';
      case 'sale':
        return 'bg-custom-marca-boton-alterno2/40 text-custom-marca-boton-variante border border-custom-marca-boton-alterno2/50';
      case 'finished':
        return 'bg-gray-200 text-gray-700 border border-gray-300';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getSaleBadgeClass = () => {
    return 'bg-amber-300/70 text-amber-900 border border-amber-400/60';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-custom-marca-boton-alterno2/5 relative">
      {/* Efectos de fondo decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-custom-marca-boton/10 rounded-full blur-3xl animate-float"
          style={{ top: '-100px', left: '-100px' }}
        ></div>
        <div
          className="absolute top-0 right-0 w-80 h-80 bg-custom-marca-boton-alterno/10 rounded-full blur-3xl animate-float"
          style={{ top: '-50px', right: '-80px', animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-72 h-72 bg-custom-marca-boton-alterno2/10 rounded-full blur-3xl animate-float"
          style={{ bottom: '-80px', left: '5%', animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-48 h-48 bg-custom-marca-boton/10 rounded-full blur-3xl animate-float"
          style={{ bottom: '50px', right: '20%', animationDelay: '2s' }}
        ></div>
      </div>

      <MockupHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Título de la página */}
        <section className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-jostBold text-custom-dark mb-3">
            Explorar Proyectos
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-champane italic">
            &quot;Pioneros del Mañana&quot;
          </p>
        </section>

        {/* Barra de búsqueda y filtros */}
        <section className="mb-12">
          <div className={`bg-white p-4 shadow-lg flex flex-col md:flex-row items-center gap-4 rounded-xl border border-gray-100 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Búsqueda */}
            <div className="relative flex-grow w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-custom-marca-boton focus:border-transparent border border-gray-200 rounded-lg font-jostRegular transition-all duration-300 hover:border-custom-marca-boton/50"
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-gray-200"></div>

            {/* Filtro Categoría */}
            <div className="flex-grow w-full md:w-auto">
              <select
                className="w-full focus:ring-2 focus:ring-custom-marca-boton focus:border-transparent border border-gray-200 rounded-lg py-2 px-3 font-jostRegular text-sm transition-all duration-300 hover:border-custom-marca-boton/50 cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Categoría</option>
                <option value="reforestacion">Reforestación</option>
                <option value="energia">Energía Renovable</option>
                <option value="agricultura">Agricultura Sostenible</option>
              </select>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-gray-200"></div>

            {/* Filtro Ubicación */}
            <div className="flex-grow w-full md:w-auto">
              <select
                className="w-full focus:ring-2 focus:ring-custom-marca-boton focus:border-transparent border border-gray-200 rounded-lg py-2 px-3 font-jostRegular text-sm transition-all duration-300 hover:border-custom-marca-boton/50 cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Ubicación</option>
                <option value="amazonas">Amazonas, Colombia</option>
                <option value="guajira">Guajira, Colombia</option>
                <option value="cusco">Cusco, Perú</option>
              </select>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-gray-200"></div>

            {/* Filtro Estado */}
            <div className="flex items-center space-x-4 flex-grow w-full md:w-auto">
              <span className="text-gray-500 text-sm font-jostRegular whitespace-nowrap">
                Estado
              </span>
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => setSelectedStatus('active')}
                  className={`px-3 py-1 rounded-full font-jostBold transition-all duration-300 ${
                    selectedStatus === 'active'
                      ? 'bg-custom-marca-boton text-white shadow-md scale-105'
                      : 'text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => setSelectedStatus('sale')}
                  className={`px-3 py-1 rounded-full font-jostBold transition-all duration-300 ${
                    selectedStatus === 'sale'
                      ? 'bg-custom-marca-boton text-white shadow-md scale-105'
                      : 'text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  En Venta
                </button>
                <button
                  onClick={() => setSelectedStatus('finished')}
                  className={`px-3 py-1 rounded-full font-jostBold transition-all duration-300 ${
                    selectedStatus === 'finished'
                      ? 'bg-custom-marca-boton text-white shadow-md scale-105'
                      : 'text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  Finalizado
                </button>
              </div>
            </div>

            {/* Botón Filtrar */}
            <div className="w-full md:w-auto">
              <button className="relative w-full md:w-auto bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante text-white font-jostBold py-2 px-6 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg group/btn">
                <span className="absolute inset-0 bg-gradient-to-r from-custom-marca-boton-variante to-custom-marca-boton opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Filtrar</span>
              </button>
            </div>
          </div>
        </section>

        {/* Grid de proyectos */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.length > 0 ? (
            projects.map((project, index) => (
            <article
              key={project.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-500 ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              } hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]`}
              style={{ 
                animationDelay: `${index * 0.15}s`,
                transitionDelay: `${index * 0.1}s`
              }}
            >
              {/* Imagen del proyecto */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-custom-marca-boton/30 via-custom-marca-boton/10 to-transparent z-10 group-hover:from-custom-marca-boton/40 transition-all duration-500"></div>
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-jostBold px-3 py-1.5 rounded-full shadow-lg z-20 group-hover:bg-black/60 transition-all duration-300">
                  {project.category}
                </span>
              </div>

              {/* Contenido de la card */}
              <div className="p-6 flex-grow flex flex-col">
                {/* Título y estado */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h2 className="text-xl font-jostBold text-custom-dark flex-1 group-hover:text-custom-marca-boton transition-colors duration-300">
                    {project.title}
                  </h2>
                  <span
                    className={`text-xs font-jostBold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 ${
                      project.status === 'active' || project.status === 'sale'
                        ? 'bg-custom-marca-boton-alterno/20 text-custom-marca-boton border border-custom-marca-boton/30'
                        : 'bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Activo
                  </span>
                </div>

                {/* Ubicación */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-jostRegular">{project.location}</span>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-3 text-center border-t border-b border-gray-100 py-4 mb-4">
                  <div className="group/metric hover:bg-custom-marca-boton-alterno2/5 rounded-lg p-2 transition-all duration-300">
                    <p className="text-xs text-gray-500 flex items-center justify-center mb-1.5 font-jostRegular group-hover/metric:text-custom-marca-boton transition-colors">
                      <svg
                        className="w-3.5 h-3.5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Precio
                    </p>
                    <p className="font-jostBold text-sm text-custom-dark group-hover/metric:text-custom-marca-boton transition-colors">
                      ${project.price.toFixed(2)} USD
                    </p>
                  </div>
                  <div className="group/metric hover:bg-custom-marca-boton-alterno2/5 rounded-lg p-2 transition-all duration-300">
                    <p className="text-xs text-gray-500 flex items-center justify-center mb-1.5 font-jostRegular group-hover/metric:text-custom-marca-boton transition-colors">
                      <svg
                        className="w-3.5 h-3.5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10m16-10v10M4 13h16M10 7h4m-4 6h4m-4 4h4M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                        />
                      </svg>
                      Tipo de Token
                    </p>
                    <p className={`font-jostBold text-sm transition-colors ${project.tokenGenesis ? 'text-green-600' : 'text-gray-600'}`}>
                      {project.tokenGenesis ? 'Token Verde' : 'Token Gris'}
                    </p>
                    <p className={`text-xs font-jostBold mt-0.5 ${project.tokenGenesis ? 'text-green-500' : 'text-gray-500'}`}>
                      {project.tokenGenesis ? 'Certificado' : 'Pre-certificado'}
                    </p>
                  </div>
                  <div className="group/metric hover:bg-custom-marca-boton-alterno2/5 rounded-lg p-2 transition-all duration-300">
                    <p className="text-xs text-gray-500 flex items-center justify-center mb-1.5 font-jostRegular group-hover/metric:text-custom-marca-boton transition-colors">
                      <svg
                        className="w-3.5 h-3.5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      {project.roi}%
                    </p>
                    <p className="font-jostBold text-sm text-custom-dark group-hover/metric:text-custom-marca-boton transition-colors">
                      ROI
                    </p>
                  </div>
                </div>

                {/* Progreso de recaudación */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span className="font-jostRegular">
                      Vendidos: {project.soldTokens.toLocaleString('es-ES')} {project.tokenName} / En Venta: {project.investorTokens.toLocaleString('es-ES')} {project.tokenName}
                    </span>
                    <span className="font-jostBold text-custom-marca-boton">{project.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-custom-marca-boton via-custom-marca-boton-variante2 to-custom-marca-boton h-2.5 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${project.progress}%` }}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
                      </div>
                    </div>
                    <span className={`text-xs font-jostBold px-2.5 py-1 rounded-md whitespace-nowrap shadow-sm transition-all duration-300 group-hover:scale-105 ${getSaleBadgeClass()}`}>
                      En Venta
                    </span>
                  </div>
                </div>

                {/* Botón Ver Detalles */}
                <div className="mt-auto">
                  <Link href={`/projects/${project.id}`} passHref legacyBehavior>
                    <a
                      className="relative w-full bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante text-white font-jostBold py-3 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center group/button"
                      aria-label={`Ver detalle del proyecto ${project.title}`}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-custom-marca-boton-variante to-custom-marca-boton opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden />
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000 pointer-events-none" aria-hidden />
                      <span className="relative z-10 flex items-center">
                        Ver Detalles
                        <svg
                          className="w-4 h-4 ml-2 group-hover/button:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </a>
                  </Link>
                </div>
              </div>
            </article>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg font-jostRegular">
                No hay proyectos disponibles en este momento.
              </p>
            </div>
          )}
        </section>

        {/* Paginación */}
        <nav
          aria-label="Pagination"
          className={`flex justify-center items-center mt-12 text-sm text-gray-600 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.5s' }}
        >
          <button
            className="flex items-center px-3 py-1 mr-4 hover:text-custom-marca-boton transition-colors font-jostRegular"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </button>
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md font-jostBold transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-custom-marca-boton text-white shadow-md scale-110'
                    : 'hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-2 font-jostRegular">...</span>
            <button
              onClick={() => setCurrentPage(10)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors font-jostBold"
            >
              10
            </button>
          </div>
          <button
            className="flex items-center px-3 py-1 ml-4 hover:text-custom-marca-boton transition-colors font-jostRegular"
            onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
            disabled={currentPage === 10}
          >
            Next
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MockupProjectsList;

