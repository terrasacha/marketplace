import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getImages } from '@marketplaces/data-access';

export default function S3Image(props: any) {
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const imageURL = props.imageURL;

  useEffect(() => {
    async function loadImageData() {
      try {
        const data = await getImages(imageURL);
        setImageData(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadImageData();
  }, [imageURL]);

  return (
    <div>
      {imageData && (
        <Image
          className="h-auto max-w-full rounded-lg"
          src={imageData}
          alt="S3 Image"
          width={500}
          height={500}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      )}
    </div>
  );
}
