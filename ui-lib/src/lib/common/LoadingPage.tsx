import { TailSpin } from 'react-loader-spinner';
interface LoadingPageProps {
  message: string;
}
const LoadingPage = (props: LoadingPageProps) => {
  const { message } = props;
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <h2 className="text-xl font-normal pb-4 flex justify-center">
        {message}
      </h2>
      <div className="relative m-4">
        <TailSpin
          width="30"
          color="#0e7490"
          wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
};

export default LoadingPage;
