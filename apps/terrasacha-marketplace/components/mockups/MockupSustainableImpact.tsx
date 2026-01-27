import React, { useEffect, useState } from 'react';
import { parseSerializedKoboData } from '@terrasacha/lib/util';

// Interface basada en la estructura real de datos de la plataforma
interface SustainableImpactData {
  waterSprings: {
    exist: boolean;
    quantity: string;
  };
  conservationProjects: string;
  diversity: {
    fauna: string;
    flora: string;
    mammals: string;
    birds: string;
  };
  technicalAssistance: string;
  strategicAllies: string;
  communityGroups: string;
}

interface MockupSustainableImpactProps {
  project?: any;
}

const MockupSustainableImpact = ({ project }: MockupSustainableImpactProps) => {
  const [impactData, setImpactData] = useState<SustainableImpactData | null>(null);

  useEffect(() => {
    const loadImpactData = async () => {
      let data: SustainableImpactData | null = null;

      // Obtener datos reales del proyecto
      if (project?.productFeatures?.items) {
        const productFeatures = project.productFeatures.items;

        // Obtener datos del ecosistema (F_nacimiento_agua contiene múltiples campos)
        const ecosystemFeature = productFeatures.find(
          (pf: any) => pf.featureID === 'F_nacimiento_agua'
        );

        let waterSprings = { exist: false, quantity: '' };
        let conservationProjects = '';
        let diversity = { fauna: '', flora: '', mammals: '', birds: '' };

        if (ecosystemFeature?.value) {
          try {
            const parsedEcosystem = await parseSerializedKoboData(ecosystemFeature.value);
            
            waterSprings = {
              exist: parsedEcosystem?.F_nacimiento_agua === 'yes',
              quantity: parsedEcosystem?.F_nacimiento_agua_quantity || '',
            };
            
            conservationProjects = parsedEcosystem?.F_conservacion_desc || '';
            diversity = {
              fauna: parsedEcosystem?.F_especies_fauna || '',
              flora: parsedEcosystem?.F_especies_flora || '',
              mammals: parsedEcosystem?.F_especies_mamiferos || '',
              birds: parsedEcosystem?.F_especies_aves || '',
            };
          } catch (error) {
            // Error parsing ecosystem data
          }
        }

        // Obtener información de relaciones (H_*)
        const technicalAssistance = productFeatures.find(
          (pf: any) => pf.featureID === 'H_asistance_desc'
        )?.value || '';

        const strategicAllies = productFeatures.find(
          (pf: any) => pf.featureID === 'H_aliados_estrategicos_desc'
        )?.value || '';

        const communityGroups = productFeatures.find(
          (pf: any) => pf.featureID === 'H_grupo_comunitario_desc'
        )?.value || '';

        // Solo crear impactData si hay al menos un dato
        if (
          waterSprings.exist ||
          conservationProjects ||
          diversity.fauna ||
          diversity.flora ||
          technicalAssistance ||
          strategicAllies ||
          communityGroups
        ) {
          data = {
            waterSprings,
            conservationProjects,
            diversity,
            technicalAssistance,
            strategicAllies,
            communityGroups,
          };
        }
      }

      setImpactData(data);
    };

    loadImpactData();
  }, [project]);

  // Si no hay datos reales, no mostrar el componente
  if (!impactData) {
    return null;
  }

  // Construir lista de características de impacto basadas en datos reales
  const impactFeatures = [];
  
  if (impactData.waterSprings.exist) {
    impactFeatures.push({
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      text: `Nacimientos de Agua: ${impactData.waterSprings.quantity}`,
    });
  }

  if (impactData.conservationProjects) {
    impactFeatures.push({
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      text: impactData.conservationProjects,
    });
  }

  if (impactData.diversity.fauna || impactData.diversity.flora) {
    impactFeatures.push({
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      text: `Biodiversidad: ${impactData.diversity.fauna || 'N/A'} fauna, ${impactData.diversity.flora || 'N/A'} flora`,
    });
  }

  if (impactData.technicalAssistance) {
    impactFeatures.push({
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      text: impactData.technicalAssistance,
    });
  }

  if (impactData.strategicAllies) {
    impactFeatures.push({
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      text: impactData.strategicAllies,
    });
  }

  if (impactData.communityGroups) {
    impactFeatures.push({
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      text: impactData.communityGroups,
    });
  }

  // Si no hay características, no mostrar el componente
  if (impactFeatures.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-custom-marca-boton to-custom-marca-boton-variante2 rounded-full"></div>
        <h3 className="text-xl font-jostBold text-custom-dark">
          Impacto Sostenible
        </h3>
      </div>
      <ul className="space-y-4">
        {impactFeatures.map((feature, index) => (
          <li
            key={index}
            className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-custom-marca-boton-alterno2/5 to-transparent hover:from-custom-marca-boton-alterno2/10 hover:shadow-md transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="text-custom-marca-boton flex-shrink-0 p-2 bg-white rounded-full shadow-sm group-hover:bg-custom-marca-boton group-hover:text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              {feature.icon}
            </div>
            <span className="font-jostRegular text-gray-700 group-hover:text-custom-marca-boton transition-colors font-medium">
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MockupSustainableImpact;
