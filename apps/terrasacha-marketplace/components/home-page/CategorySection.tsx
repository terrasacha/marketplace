import Link from "next/link";
import { useWallet, CardanoWallet } from "@meshsdk/react";

export default function CategorySection(props: any) {
  const { connected } = useWallet();
  const categories = props.categories;

  return (
    <div className="bg-gray-100">
      {connected ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
            <h2 className="text-2xl font-bold text-gray-900">
              Proyectos disponibles
            </h2>

            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
              {categories.map((category: any) => (
                <h3 key={category.id} className="mt-6 text-sm text-gray-500">
                  <Link href={`/category/${category.id}`}>{category.name}</Link>
                </h3>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
            <h2 className="text-2xl font-bold text-gray-900">
              Conecte su billetera para interactuar
            </h2>
            <CardanoWallet />
          </div>
        </div>
      )}
    </div>
  );
}
