import React from 'react';
import { getCategories, getProjects } from '@terrasacha/backend';
import HomeContainer from '@terrasacha/components/home-page/HomeContainer';
import { MyPage } from '@terrasacha/components/common/types';

const Home: MyPage = (props: any) => {
  return (
    <>
      {' '}
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
