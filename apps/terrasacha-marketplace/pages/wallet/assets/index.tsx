import { MyPage } from '@suan//components/common/types';
import WalletAssets from '@marketplaces/ui-lib/src/lib/wallet/WalletAssets';

const Assets: MyPage = (props: any) => {
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-custom-marca-boton-alterno2/5 relative">
      {/* Efectos de fondo decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-custom-marca-boton/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-custom-marca-boton-alterno/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="w-full p-5 lg:p-8 relative z-10">
        <WalletAssets />
      </div>
    </div>
  );
};

export default Assets;
Assets.Layout = 'Main'; // Asigna el diseño principal (Main)

export async function getServerSideProps(context: any) {
  // const user = await getCurrentUser();

  // const userWalletData = await getUserWalletData(projectData);
  return {
    props: {
      userWalletData: {
        address: '',
        amount: '',
      },
    },
  };
}
