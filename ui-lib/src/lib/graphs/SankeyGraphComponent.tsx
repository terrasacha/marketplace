import React from 'react';
import { Sankey, Tooltip, Rectangle } from 'recharts';

const data = {
  nodes: [
    { name: 'Visit' },
    { name: 'Direct-Favourite' },
    { name: 'Page-Click' },
    { name: 'Detail-Favourite' },
    { name: 'Lost' },
  ],
  links: [
    { source: 0, target: 1, value: 3728.3 },
    { source: 0, target: 2, value: 354170 },
    { source: 2, target: 3, value: 62429 },
    { source: 2, target: 4, value: 291741 },
  ],
};

const SankeyGraphComponent = () => {
  return (
    <Sankey
      width={500}
      height={300}
      data={data}
      margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
    >
      <Tooltip />
      <Rectangle />
    </Sankey>
  );
};

export default SankeyGraphComponent;
