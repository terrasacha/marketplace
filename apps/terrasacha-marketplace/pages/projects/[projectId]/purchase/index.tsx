import React, { useEffect, useContext } from 'react';
import MockupPurchasePage from '@terrasacha/components/mockups/MockupPurchasePage';
import MockupHeader from '@terrasacha/components/mockups/MockupHeader';
import MockupFooter from '@terrasacha/components/mockups/MockupFooter';
import ProjectInfoContext from '@terrasacha/store/projectinfo-context';
import { MyPage } from '@terrasacha/components/common/types';
import { getActualPeriod } from '@terrasacha/utils/generic/getActualPeriod';
import { getProject } from '@marketplaces/data-access';
import Link from 'next/link';

const DEFAULT_PROJECT_IMAGE = '/images/home-page/image.png';

const resolveProjectImageUrl = (project: any): string => {
  const firstImage = project?.images?.items?.[0];
  const imagePath = firstImage?.imageURLToDisplay || firstImage?.imageURL;

  if (!imagePath) return DEFAULT_PROJECT_IMAGE;
  if (imagePath.includes('http')) return imagePath;

  const s3Endpoint = (process.env.NEXT_PUBLIC_s3EndPoint || '').endsWith('/')
    ? process.env.NEXT_PUBLIC_s3EndPoint
    : `${process.env.NEXT_PUBLIC_s3EndPoint || ''}/`;

  if (!s3Endpoint || s3Endpoint === '/') return DEFAULT_PROJECT_IMAGE;

  if (imagePath.startsWith('public/')) return `${s3Endpoint}${imagePath}`;
  return `${s3Endpoint}public/${imagePath}`;
};

const resolveTokenPrice = (actualPeriod: any, periods: any[]): number => {
  const periodPrice = parseFloat(actualPeriod?.price);
  if (!Number.isNaN(periodPrice) && periodPrice > 0) return periodPrice;

  // Si la fecha actual quedó fuera de los períodos, usar el precio del último período conocido
  if (periods.length > 0) {
    const lastPeriodPrice = parseFloat(periods[periods.length - 1]?.price);
    if (!Number.isNaN(lastPeriodPrice) && lastPeriodPrice >= 0) return lastPeriodPrice;
  }

  return 0;
};

const PurchasePage: MyPage = (props: any) => {
  const { project, image } = props;
  const { handleProjectInfo } = useContext<any>(ProjectInfoContext);

  useEffect(() => {
    if (typeof project === 'object' && project) {
      const tokenCurrency: string =
        project.productFeatures?.items?.find(
          (item: any) => item.featureID === 'GLOBAL_TOKEN_CURRENCY'
        )?.value || 'USD';

      let tokenHistoricalData: any[] = [];
      try {
        const historicalFeature = project.productFeatures?.items?.find(
          (item: any) => item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA'
        );
        tokenHistoricalData = JSON.parse(historicalFeature?.value || '[]');
        if (!Array.isArray(tokenHistoricalData)) tokenHistoricalData = [];
      } catch {
        tokenHistoricalData = [];
      }

      const periods = tokenHistoricalData.map((tkhd: any) => {
        return {
          period: tkhd.period,
          date: new Date(tkhd.date),
          price: parseFloat(tkhd.price || 0),
          amount: parseInt(tkhd.amount || 0, 10),
        };
      });

      const actualPeriod: any = getActualPeriod(Date.now(), periods);
      const tokenPrice = resolveTokenPrice(actualPeriod, periods);

      // Obtener token name desde productFeatures si no existe en tokens
      const tokenNameFeature = project.productFeatures?.items?.find(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_NAME'
      );
      const tokenName = tokenNameFeature?.value || project.name?.replace('Proyecto - ', '') || '';

      // Obtener token desde tokens.items o crear un objeto con datos desde productFeatures
      const tokenFromItems = project.tokens?.items?.[0];
      const token = tokenFromItems
        ? {
            ...tokenFromItems,
            oraclePrice: tokenFromItems.oraclePrice ?? '0',
            tokenName: tokenFromItems.tokenName || tokenName,
          }
        : {
            id: null,
            tokenName: tokenName,
            oraclePrice: '0',
            policyID: null,
            supply: null,
          };

      // Obtener tokens del inversionista
      const tokenDistributionFeature = project.productFeatures?.items?.find(
        (item: any) => item.featureID === 'GLOBAL_TOKEN_AMOUNT_DISTRIBUTION'
      );
      let investorTokens = 0;
      if (tokenDistributionFeature?.value) {
        try {
          const distribution = JSON.parse(tokenDistributionFeature.value);
          const investorDist = distribution.find((d: any) => d.CONCEPTO === 'INVERSIONISTA');
          investorTokens = parseInt(investorDist?.CANTIDAD || 0, 10);
        } catch (e) {
          // Error parsing token distribution
        }
      }

      const projectInfo = {
        projectID: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectFeatures: project.productFeatures?.items || [],
        tokenCurrency: tokenCurrency,
        tokenPrice: tokenPrice,
        categoryID: project.categoryID,
        scripts: project.scripts?.items || [],
        token: token,
        createdAt: new Date(project.createdAt).toLocaleDateString('es-ES'),
        projectImage: image || resolveProjectImageUrl(project) || DEFAULT_PROJECT_IMAGE,
        investorTokens: investorTokens,
      };
      handleProjectInfo(projectInfo);
    }
  }, [project, image]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#b1c181]/10">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236e6c35' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10">
        <MockupHeader />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-2 text-[#6e6c35] hover:text-[#44482c] font-jostBold mb-6 group transition-colors"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al proyecto
          </Link>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-jostBold text-[#44482c] mb-2">Comprar Tokens</h1>
            <p className="text-gray-600 font-jostRegular">
              Adquiere tokens del proyecto y contribuye a la conservación ambiental
            </p>
          </div>

          {/* Purchase Component */}
          <MockupPurchasePage />
        </main>

        <MockupFooter />
      </div>
    </div>
  );
};

export default PurchasePage;
PurchasePage.Layout = 'NoLayout';

export async function getServerSideProps(context: any) {
  const { projectId } = context.params;
  const project = await getProject(projectId);

  if (!project) {
    return { notFound: true };
  }

  return {
    props: {
      project,
      image: resolveProjectImageUrl(project),
    },
  };
}
