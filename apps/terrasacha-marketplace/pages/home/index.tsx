import React from 'react';
import { getCategories, getProjects } from '@marketplaces/data-access';
import HomeContainer from '../../components/home-page/HomeContainer';
import { MyPage } from '../../components/common/types';

const Home: MyPage = (props: any) => {
  return (
    <>
      <HomeContainer {...props} />
    </>
  );
};

export async function getServerSideProps() {
  const categories = await getCategories();
  const projects = await getProjects();

  return {
    props: {
      categories: categories,
      projects: projects,
    },
  };
}

export default Home;
Home.Layout = 'Main';
