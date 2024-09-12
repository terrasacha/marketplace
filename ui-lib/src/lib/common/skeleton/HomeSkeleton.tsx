const HomeSkeleton = () => {
  return (
    <div className="flex p-4 h-[100vh] w-[100%] gap-x-2 ">
      <div
        role="status"
        className="animate-pulse h-full w-[20%] bg-gray-200 rounded-lg "
      ></div>
      <div className="flex flex-col w-[80%] h-full ">
        <div
          role="status"
          className="animate-pulse h-20 w-full bg-gray-200 rounded-lg mb-2"
        ></div>
        <div
          role="status"
          className="animate-pulse flex-grow w-full bg-gray-200 rounded-lg"
        ></div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
