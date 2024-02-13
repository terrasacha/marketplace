import { CreateOrderCard } from '@marketplaces/ui-lib';
import { MyPage } from '@suan/components/common/types';

const CreateOrder: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full p-5">
        <CreateOrderCard />
      </div>
    </>
  );
};

export default CreateOrder;
CreateOrder.Layout = 'Main'; // Asigna el diseño principal (Main)
