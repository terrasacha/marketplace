import React, { useState, useEffect } from 'react';
import { CardProject } from '@marketplaces/ui-lib';
import Pagination from '../home-page/paginationProject';
import { Range } from 'react-range';

const PAGE_SIZE = 9; // Number of projects per page
interface ProductFeature {
  featureID: string;
  value: any;
}

export default function HomeContainer(props: { projects: any[]; env: any }) {
  const { projects } = props;
  function getTokenPrice(project: any): any {
    const tokenFeature = project.productFeatures.items.find(
      (item: any) => item.featureID === 'GLOBAL_TOKEN_PRICE'
    );
    return tokenFeature?.value || null;
  }

  // const projectsWithPrice = projects.map((project) => ({
  //   ...project,
  //   price: getTokenPrice(project),
  // }));

  const defaultSelectedCategories: string[] = [];
  const defaultSelectedYears: string[] = [];
  const defaultSelectedPriceRange: [number, number] = [0, 1000];

  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultSelectedCategories
  );
  const [selectedYears, setSelectedYears] =
    useState<string[]>(defaultSelectedYears);
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    [number, number]
  >(defaultSelectedPriceRange);

  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Extract unique category names from projects
  const uniqueCategories = Array.from(
    new Set(projects.map((project) => project.category.name))
  );

  // Extract unique years from projects
  const uniqueYears = Array.from(
    new Set(projects.map((project) => project.createdAt.split('-')[0]))
  );

  // Function to toggle selection of a category
  const toggleCategorySelection = (category: string) => {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Function to toggle selection of a year
  const toggleYearSelection = (year: string) => {
    const isSelected = selectedYears.includes(year);
    if (isSelected) {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Function to handle reset button
  const resetFilters = () => {
    setSelectedCategories(defaultSelectedCategories);
    setSelectedYears(defaultSelectedYears);
    setSelectedPriceRange(defaultSelectedPriceRange);
    setFilteredProjects(projects);
    setIsFiltering(false);
  };

  // Function to handle filter button click
  const handleSearch = () => {
    let filtered = projects;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((project) =>
        selectedCategories.includes(project.category.name)
      );
    }

    if (selectedYears.length > 0) {
      filtered = filtered.filter((project) =>
        selectedYears.includes(project.createdAt.split('-')[0])
      );
    }

    // Filter by selected price range
    filtered = filtered.filter((project) => {
      const tokenPrice = getTokenPrice(project);
      return (
        tokenPrice >= selectedPriceRange[0] &&
        tokenPrice <= selectedPriceRange[1]
      );
    });

    setFilteredProjects(filtered);
    setCurrentPage(1);
    setIsFiltering(true);
  };
  //Sort Recientes button functions
  const handleSort = () => {
    const sorted = [...filteredProjects];

    sorted.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.createdAt.localeCompare(b.createdAt);
      } else {
        return b.createdAt.localeCompare(a.createdAt);
      }
    });

    setFilteredProjects(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  //Searcher funcionality
  const handleSearchQuery = (query: string) => {
    const normalizedQuery = query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const filtered = projects.filter(
      (project) =>
        project.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase()
          .includes(normalizedQuery.toLocaleLowerCase()) ||
        project.description
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase()
          .includes(normalizedQuery.toLocaleLowerCase())
    );
    setFilteredProjects(filtered);
    setCurrentPage(1);
    setIsFiltering(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearchQuery(searchQuery);
  };

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-[#F4F8F9] h-auto w-full px-5 pt-6">
      <div className="p-4 border-gray-200 rounded-lg">
        <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-gray-500">
          Proyectos que puedes apoyar
        </h2>
        <div className="mb-8 pr-8">
          <div className="mt-8 flex max-w-full filtros_container">
            <div className="filter-function mr-2">
              <button
                className="flex mb-2 border border-gray-300 rounded px-6 pb-2 pt-2.5 text-s text-gray-400 leading-normal transition duration-150 ease-in-out"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                Filtros
                <div className="flex items-center ml-3">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"
                    />
                  </svg>
                </div>
              </button>
            </div>
            <div className="search-function mt-4 lg:mt-0">
              <form onSubmit={handleSubmit}>
                <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white w-">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="search"
                    id="default-search"
                    className="block w-full px-2 py-3 pl-5 text-sm text-gray-900 border border-gray-300 bg-gray-50 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md"
                    placeholder="Buscar por proyectos"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                  >
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </form>
            </div>
            <div className="order-function flex sm:ml-auto">
              <p className="lg:flex items-center  text-gray-400">
                Ordenar por:
                <span
                  className={` lg:flex items-center ml-2 cursor-pointer font-medium ${
                    sortOrder === 'asc' ? 'text-blue-800' : 'text-gray-400'
                  }`}
                  onClick={handleSort}
                >
                  Recientes
                </span>
              </p>
            </div>
          </div>
          <div
            className={`filter-expand ${isFilterExpanded ? 'block' : 'hidden'}`}
          >
            <div className="filter-expandList">
              <div className="m-1 p-2 text-xs">
                <h3 className="py-1">
                  Rango de precio: ${selectedPriceRange[0]} - $
                  {selectedPriceRange[1]}{' '}
                </h3>
                <Range
                  step={1}
                  min={0}
                  max={2000}
                  values={selectedPriceRange}
                  onChange={(values: number[]) =>
                    setSelectedPriceRange([values[0], values[1]])
                  }
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-1 bg-gray-200 dark:bg-gray-700 rounded"
                      style={{ marginTop: '10px' }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      className="w-5 h-5 rounded-full cursor-pointer rc-slider-handle"
                    />
                  )}
                />
              </div>
              <div className="m-1 p-2 text-xs">
                <h3 className="py-1">Categorias/Años:</h3>
                <div>
                  {uniqueYears &&
                    uniqueYears.map((year) => {
                      if (typeof year === 'string') {
                        return (
                          <button
                            key={year}
                            onClick={() => toggleYearSelection(year)}
                            className={`px-5 py-2 my-1 rounded-[.2rem] mr-2 text-xs text-[#1E446E] border ${
                              selectedYears.includes(year)
                                ? 'bg-[#69A1B3] text-white'
                                : ''
                            } transition duration-150 ease-in-out`}
                          >
                            {year}
                          </button>
                        );
                      }
                      return null;
                    })}
                  {uniqueCategories &&
                    uniqueCategories.map((category) => {
                      if (typeof category === 'string') {
                        return (
                          <button
                            key={category}
                            onClick={() => toggleCategorySelection(category)}
                            className={`px-5 py-2 my-1 rounded-[.2rem] mr-2 text-xs text-[#1E446E] border ${
                              selectedCategories.includes(category)
                                ? 'bg-[#69A1B3] text-white'
                                : ''
                            } transition duration-150 ease-in-out`}
                          >
                            {category}
                          </button>
                        );
                      }
                      return null;
                    })}
                </div>
              </div>
              <button
                className="m-1 p-2 h-9  w-full rounded bg-[#333333] text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#333] transition duration-150 ease-in-out"
                onClick={handleSearch}
              >
                Aplicar
              </button>
              <button
                className="m-1 p-2 h-9  w-full text-xs font-medium underline leading-normal  transition duration-150 ease-in-out"
                onClick={resetFilters}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <ul className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 auto-rows-auto mb-4 rounded bg-transparent dark:bg-gray-800">
            {filteredProjects.map((project: any, index: number) => {
              if (index >= startIndex && index < endIndex) {
                return (
                  <CardProject key={project.id} project={{ ...project }} />
                );
              }
              return null;
            })}
          </ul>
        ) : (
          <div>
            <p className="my-8 text-center holder-text">
              Aún no tenemos proyectos disponibles, espéralos pronto.
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -960 960 960"
                width="24"
                className="m-auto"
                fill="#9ca3af"
              >
                <path d="M250-320h60v-10q0-71 49.5-120.5T480-500q71 0 120.5 49.5T650-330v10h60v-10q0-96-67-163t-163-67q-96 0-163 67t-67 163v10Zm34-270q41-6 86.5-32t72.5-59l-46-38q-20 24-55.5 44T276-650l8 60Zm392 0 8-60q-30-5-65.5-25T563-719l-46 38q27 33 72.5 59t86.5 32ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
              </svg>
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPreviousPage={previousPage}
        />
      </div>
    </div>
  );
}
