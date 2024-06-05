import { WalletIcon } from '@marketplaces/ui-lib/src/lib/icons/WalletIcon';

const FinancialTab: React.FC<any> = ({ financialData }) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {financialData.map((item: any, index: number) => {
          return (
            <div key={index}>
              <div className="item-icon"></div>
              <div className="item-info flex items-center my-2 py-2">
                <WalletIcon className='w-10 h-10'/>
                <div className="item-infoText mx-2">
                  <p className="item-infoPrice text-[#2E2F30]">{`${parseFloat(
                    item.CANTIDAD
                  ).toLocaleString('es-CO')} ${item.UNIDAD}`}</p>
                  <p className="item-infoTitle text-[#484848]">
                    {item.CONCEPTO}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FinancialTab;
