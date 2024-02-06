import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({ text, children }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <div
        className={`hidden w-auto group-hover:block absolute z-10 bg-gray-800 text-white text-xs mt-2 py-2 px-4 rounded-md shadow-md left-1/2 transform -translate-x-1/2 transition-opacity duration-500 delay-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className='whitespace-nowrap'>{text}</p>
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Tooltip;
