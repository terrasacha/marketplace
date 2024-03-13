import React from 'react';
import { MyPage } from '@suan/components/common/types';
import { BarGraphComponent, SankeyGraphComponent } from '@marketplaces/ui-lib';
const Graphs: MyPage = (props: any) => {
  return (
    <>
      GRapsh
      <BarGraphComponent />
      <SankeyGraphComponent />
    </>
  );
};

export default Graphs;
Graphs.Layout = 'Main';
