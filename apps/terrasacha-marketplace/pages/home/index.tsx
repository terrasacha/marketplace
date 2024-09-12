import React from 'react';
import { getCategories, getProjects } from '@marketplaces/data-access';
import HomeContainer from '@terrasacha/components/home-page/HomeContainer';
import { MyPage } from '@terrasacha/components/common/types';

const Home: MyPage = (props: any) => {
  return (
    <>
      <HomeContainer {...props} />
    </>
  );
};

export async function getServerSideProps() {
  const categories = await getCategories();
  const projects = await getProjects(process.env['NEXT_PUBLIC_MARKETPLACE_NAME']);

  return {
    props: {
      categories: categories,
      projects: projects,
    },
  };
}

export default Home;
Home.Layout = 'Main';
