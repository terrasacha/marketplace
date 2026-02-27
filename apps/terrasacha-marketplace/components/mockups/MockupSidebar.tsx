import MockupTokenDetails from './MockupTokenDetails';
import MockupLocationMap from './MockupLocationMap';
import MockupSustainableImpact from './MockupSustainableImpact';

interface MockupSidebarProps {
  project?: any;
}

const MockupSidebar = ({ project }: MockupSidebarProps) => {
  return (
    <div className="space-y-6">
      <MockupTokenDetails project={project} />
      <MockupLocationMap project={project} />
      <MockupSustainableImpact project={project} />
    </div>
  );
};

export default MockupSidebar;

