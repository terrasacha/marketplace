declare module "myTypes" {
  interface Image {
    id: string;
    productID: string;
    title: string;
    imageURL: string;
    imageURLToDisplay: string;
    format: string;
    carouselDescription: string;
  }

  interface Project {
    id: string;
    description: string;
    categoryID: string;
    amountToBuy: string;
    name: string;
    status: string;
    updatedAt: Date;
    createdAt: Date;
    images: { items: [Image] };
    amountToBuy: string;
  }

  interface Category {
    id: string;
    name: string;
    products: { items: [Project] };
  }
}

interface User {}
module.exports = {
  Image,
  Products,
  Category,
};

// interface AssetMetadata {
//   name: string;
//   project_id: string;
//   description: string;
//   createdAt: string;
//   category: string;
//   location: string;
//   use?: Use;
// }

// interface Use {
//   [key: string]: any[];
// }

// interface ItemList {
//   [index: number]: string;
// }

// interface MintButtonProps {
//   data:
//     | {
//         quantity: number;
//         assetMetadata: AssetMetadata;
//         price: string;
//       }
//     | undefined;
//   mintResults: (result: { success: boolean; txHash?: string }) => void;
// }
