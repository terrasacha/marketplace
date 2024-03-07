import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PageHeader({ imageURL }: { imageURL?: string }) {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#287993] text-sm mb-5"
        >
          <svg
            className="w-3 h-3 mr-2 text-[#287993]  dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 8 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
            />
          </svg>
          Regresar
        </button>
      </div>
      {imageURL && (
        <div className="relative w-100 h-52 mb-4">
          <Image
            className="rounded-lg"
            src={imageURL}
            alt="banner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}
