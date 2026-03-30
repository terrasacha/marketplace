import React, { useContext, useEffect, useState } from 'react';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { EyeIcon } from '../icons/EyeIcon';
import WalletAssets from '../wallet/WalletAssets';
import ClaimTokens from '../wallet/ClaimTokens';
import Card from '../common/Card';
import CopyToClipboard from '../common/CopyToClipboard';
import ExternalLink from '../common/ExternalLink';
import Tooltip from '../common/Tooltip';
import Transactions from '../wallet/Transactions';
import { WalletContext } from '@marketplaces/utils-2';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
// Definir el tipo de 'token'
interface WalletDashboardProps {
  userWalletData: any;
  address: string;
  ada: number;
  img_url: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function WalletDashboard(props: WalletDashboardProps) {
  const { walletData } =
    useContext<any>(WalletContext);
  const [showAddress, setShowAddress] = useState<boolean>(true);

  const handleShowAddress = () => {
    setShowAddress(!showAddress);
  };

  const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente:'font-jostBold',
      fuenteAlterna:'font-jostRegular',
    },
  
    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor:  'bg-custom-dark' ,
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente:'font-semibold',
    fuenteAlterna:'font-medium',
  };
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-custom-marca-boton-alterno2/5 relative">
      {/* Efectos de fondo decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-custom-marca-boton/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-custom-marca-boton-alterno/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header modernizado */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-3xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante2 bg-clip-text text-transparent">
              Cuadro de Mando
            </h2>
            <p className="text-sm text-gray-500 font-jostRegular mt-1">Gestiona tu billetera y activos</p>
          </div>
        </div>
        
        <ClaimTokens />
        
        <div className="grid grid-cols-1 2xl:grid-cols-5 2xl:space-x-5 gap-5">
          <div className="flex-col col-span-3 space-y-5">
            <Card className="h-fit shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-scale-in">
              <Card.Header title="Cuenta" className={`${colors.fuente}`} />
              <Card.Body>
                <div className="w-full rounded-xl bg-gradient-to-br from-custom-marca-boton via-custom-marca-boton-variante to-custom-marca-boton-variante2 p-6 shadow-xl relative overflow-hidden">
                  {/* Efecto shimmer en el fondo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  
                  <div className="flex gap-4 items-center relative z-10">
                    <div className="flex-none">
                      <div className="relative inline-flex items-center justify-center w-20 h-20 overflow-hidden bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="font-jostBold text-lg text-custom-marca-boton">NS</span>
                      </div>
                    </div>
                    <div className="flex-1 w-64 text-white">
                      <p className="text-xl font-jostBold mb-2">Mi billetera</p>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-sm truncate w-52 font-jostRegular bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          {walletData ? walletData?.address : 'loading ...'}
                        </p>
                        <CopyToClipboard
                          iconClassName="h-5 w-5 hover:scale-110 transition-transform"
                          copyValue={walletData?.address}
                          tooltipLabel="Copiar !"
                        />
                        <ExternalLink
                          iconClassName="h-5 w-5 hover:scale-110 transition-transform"
                          tooltipLabel="Consultar en CardanoScan Preview"
                          externalURL={
                            'https://preview.cardanoscan.io/address/' +
                            walletData?.address
                          }
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-jostBold text-white">
                          {showAddress ? (
                            <>
                              {walletData
                                ? parseInt(walletData?.balance) / 1000000
                                : '0'}{' '}
                              <span className="text-lg font-jostRegular text-white/80">ADA</span>
                            </>
                          ) : (
                            <>********</>
                          )}
                        </p>
                        <Tooltip
                          text={showAddress ? 'Ocultar Saldo' : 'Mostrar Saldo'}
                        >
                          <div onClick={handleShowAddress} className="cursor-pointer hover:scale-110 transition-transform duration-300">
                            {showAddress ? (
                              <EyeIcon className="h-6 w-6 text-white/80 hover:text-white" />
                            ) : (
                              <EyeOffIcon className="h-6 w-6 text-white/80 hover:text-white" />
                            )}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          <div className="h-fit animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Transactions txPerPage={8} />
          </div>
        </div>
        <div className="flex-col col-span-2 space-y-5 mt-8 2xl:mt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <WalletAssets
            chartActive={true}
            tableActive={false}
            tableItemsPerPage={5}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
