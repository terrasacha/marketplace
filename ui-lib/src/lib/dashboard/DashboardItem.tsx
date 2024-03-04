interface DashboardItemProps {
  icon: JSX.Element;
  value: string;
  label: string;
}

const DashboardItem: React.FC<DashboardItemProps> = ({
  icon,
  value,
  label,
}) => {
  return (
    <div className="bg-custom-fondo  dark:bg-[#69a1b3] shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] rounded-md flex items-center justify-between p-4 dark:border-[#588695] text-custom-dark dark:text-gray-800 font-medium group">
      <div className="font-semibold">
        <p className="text-custom-dark-hover text-2xl">{value}</p>
        <p>{label}</p>
      </div>
      <div className="flex justify-center items-center w-14 h-14 bg-custom-dark-hover dark:bg-white rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default DashboardItem;
