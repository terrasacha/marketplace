import { MyPage } from '@terrasacha/components/common/types';
import MockupProjectsList from '@terrasacha/components/mockups/MockupProjectsList';
import { getProjects } from '@marketplaces/data-access';
import { mapProductToProjectInterface } from '@terrasacha/lib/mappers';

interface HomePageProps {
  projects: any[];
}

const HomePage: MyPage<HomePageProps> = ({ projects }) => {
  return <MockupProjectsList projects={projects} />;
};

export async function getServerSideProps() {
  try {
    const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME;
    const products = await getProjects(marketplaceName);

    // Mapear cada producto a la interface Project
    const projects = await Promise.all(
      products.map((product: any) => mapProductToProjectInterface(product))
    );

    return {
      props: {
        projects: projects || [],
      },
    };
  } catch (error) {
    return {
      props: {
        projects: [],
      },
    };
  }
}

export default HomePage;
HomePage.Layout = 'NoLayout';
