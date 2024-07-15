import React from 'react';
import HomeContainer from '@suan/components/home-page/HomeContainer';
import { MyPage } from '@suan/components/common/types';
import { getCategories, getProjects } from '@marketplaces/data-access';

const Home: MyPage = (props: any) => {
  return (
    <>
      <HomeContainer {...props} />
    </>
  );
};

export async function getServerSideProps() {
  const categories = await getCategories();
  const projects = await getProjects('Suan');
  return {
    props: {
      categories: categories,
      projects: projects,
    },
  };
}

export default Home;
Home.Layout = 'Main';
