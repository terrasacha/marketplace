import Button from '../components/Button';
export function Index() {
  return (
    <div className=" bg-gray-500 ">
      <h1 className="text-2xl">Testing Tailwind!</h1>
      <button className="border-2 border-red-500 font-extrabold px-4 py-10">
        Hola
      </button>
      <Button />
    </div>
  );
}

export default Index;
