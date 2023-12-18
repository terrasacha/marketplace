interface DetailProps {
  tabData: tabProps; // Expect an individual tabProps object
}

interface tabProps {
  title: string;
  description: string;
  content?: any;
}

const TabsComponents: React.FC<DetailProps> = ({ tabData }) => {
  return (
    <div className="tab-info">
      <div>
        <h3 className="text-xl font-semibold text-[#2E2F30]">{tabData.title}</h3>
        <p className="tab-description py-2 text-[#484848]">{tabData.description}</p>
      </div>
      { tabData.content }
    </div>
  );
};

export default TabsComponents;
