import { LineChartComponent } from "../../ui-lib";
import DefaultCard from "./DefaultCard";
import TokenCard from "./TokenCard";
export default function DashboardProject(props: any){
    const project = props.project;
    const projectData = props.projectData;

    return(
        <div className="bg-[#F4F8F9] h-auto w-full px-5 pt-6">
        <h2 className="p-4 text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-500">
          {project.name}
        </h2>
  
        <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
          <div className="row-span-2 lg:col-span-1 2xl:col-span-1 lg:row-span-2">
            <TokenCard projectName={project.name} categoryName={project.category.name}/>
          </div>
          
          <div className="lg:col-span-1">
            <DefaultCard />
          </div>
          
          <div className="lg:col-span-1">
            <DefaultCard />
          </div>
          
          <div className="lg:col-span-1">
            <DefaultCard />
        </div>
          <div className="lg:col-span-1">
            <DefaultCard />
          </div>
          
          <div className="lg:col-span-1">
            <DefaultCard />
          </div>
          
          <div className="lg:col-span-1">
            <DefaultCard />
        </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6 mt-8">
          
          <div className="bg-custom-dark-hover p-4 rounded-md shadow-lg col-span-2 lg:col-span-4 2xl:col-span-3 lg:row-span-2 max-h-64 flex justify-center">
            <LineChartComponent />
          </div>
          
          <div className=" lg:col-span-2 2xl:col-span-1">
          <DefaultCard />
          </div>
          
          <div className=" lg:col-span-2 2xl:col-span-1">
          <DefaultCard />
          </div>
  
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6 mt-8">
          
          <div className="lg:col-span-1 ">
           <DefaultCard />
          </div>
          
          <div className="lg:col-span-1 ">
           <DefaultCard />
          </div>
          <div className="lg:col-span-1 ">
           <DefaultCard />
          </div>
          
          <div className="lg:col-span-1 ">
           <DefaultCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-6 mt-8">
          
          <div className="lg:col-span-1 border border-pink-700 p-4">
            Box
          </div>
          
          <div className="lg:col-span-1 border border-pink-700 p-4">
            Box
          </div>
        </div>
      </div>
    )
}