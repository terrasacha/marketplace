import { MyPage } from '@terrasacha/components/common/types';
import MockupHeader from '@terrasacha/components/mockups/MockupHeader';
import MockupProjectDetail from '@terrasacha/components/mockups/MockupProjectDetail';
import MockupSidebar from '@terrasacha/components/mockups/MockupSidebar';
import MockupFooter from '@terrasacha/components/mockups/MockupFooter';

const MockupsPage: MyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-custom-marca-boton-alterno2/5">
      {/* Efecto de fondo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-custom-marca-boton/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-custom-marca-boton-alterno/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="relative z-10">
        <MockupHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sección principal izquierda */}
            <div className="lg:col-span-2">
              <MockupProjectDetail />
            </div>

            {/* Sidebar derecho con paneles informativos */}
            <div className="lg:col-span-1">
              <MockupSidebar />
            </div>
          </div>
        </div>
        <MockupFooter />
      </div>
    </div>
  );
};

export default MockupsPage;
MockupsPage.Layout = 'NoLayout';

