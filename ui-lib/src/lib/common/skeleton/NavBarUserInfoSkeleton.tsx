const NavBarUserInfoSkeleton = () => {
    return (
        <div
        role='status'
      className="animate-pulse h-10 flex gap-4 items-center justify-center text-sm font-normal focus:z-10 focus:outline-none rounded-lg  py-8 px-4"
    >
      <div className="flex flex-col">
      <div className="w-20 h-3 bg-gray-200 rounded-full dark:bg-gray-700 mb-3"></div>
        <div className="w-20 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
      </div>
      <div
        // @ts-ignore
        className={`relative text-white font-normal rounded-lg w-10 h-10 bg-gray-300`}
      >
      </div>
    </div>
    )
}

export default NavBarUserInfoSkeleton
