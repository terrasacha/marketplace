import React from 'react';
//import { getCategories, getProjects } from '@suan/backend';
import HomeContainer from '@suan/components/home-page/HomeContainer';
import { MyPage } from '@suan/components/common/types';
import { getCategories, getProjects } from '@marketplaces/data-access';

const Home: MyPage = (props: any) => {
  return (
    <>
      {' '}
      <HomeContainer {...props} />
    </>
  );
};

export async function getServerSideProps() {
  //const response = await fetch('http://localhost:4100/api/calls/backend/getCategories');
  //const categories = await response.json()
  
  //const response2 = await fetch('http://localhost:4100/api/calls/backend/getProjects');
  //const projects = await response2.json()

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
