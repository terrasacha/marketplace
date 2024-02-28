interface DashboardItemProps {
	icon: JSX.Element;
	value: string;
	label: string;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ icon, value, label }) => {
	return (
		<div className="bg-custom-dark-hover  dark:bg-[#69a1b3] shadow-lg rounded-md flex items-center justify-between p-4 dark:border-[#588695] text-amber-400 dark:text-gray-800 font-medium group">
			<div className="font-semibold">
				<p className="text-[#DDD] text-2xl">{value}</p>
				<p>{label}</p>
			</div>
			<div className="flex justify-center items-center w-14 h-14 bg-amber-500 dark:bg-white rounded-full transition-all duration-300 transform group-hover:rotate-12">
				{icon}
			</div>
		</div>
	);
};

export default DashboardItem