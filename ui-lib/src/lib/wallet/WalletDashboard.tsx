import React, { useContext, useState } from 'react';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { EyeIcon } from '../icons/EyeIcon';
import ClaimTokens from '../wallet/ClaimTokens';
import Card from '../common/Card';
import CopyToClipboard from '../common/CopyToClipboard';
import ExternalLink from '../common/ExternalLink';
import Tooltip from '../common/Tooltip';
import Transactions from '../wallet/Transactions';
import { WalletContext } from '@marketplaces/utils-2';

interface WalletDashboardProps {
  userWalletData: any;
  address: string;
  ada: number;
  img_url: string;
}

const truncateAddress = (address: string, startLength: number, endLength: number) => {
  if (address.length <= startLength + endLength) return address;
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};

export default function WalletDashboard(props: WalletDashboardProps) {
  const { walletData } = useContext<any>(WalletContext);
  const [showAddress, setShowAddress] = useState<boolean>(true);

  const handleShowAddress = () => {
    setShowAddress(!showAddress);
  };

  return (
    <>
      <ClaimTokens />
      <div className="grid grid-cols-1 w-full space-x-5">
        <div className="flex-col space-y-5 w-full">
          <Card className="h-fit w-full">
            <Card.Header title="Cuenta" />
            <Card.Body>
              <div className="w-full rounded-lg bg-custom-dark p-3">
                <div className="flex gap-3 items-center w-full">
                  <div className="flex-none">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-white rounded-lg">
                      <span className="font-medium text-custom-dark">NS</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full text-white">
                    <p className="text-lg">Mi billetera</p>
                    <div className="flex items-center gap-2 w-full">
                      <p className="text-sm truncate w-full max-w-[200px]">
                        {walletData ? truncateAddress(walletData?.address, 10, 6) : 'loading ...'}
                      </p>
                      <CopyToClipboard
                        iconClassName="h-5 w-5"
                        copyValue={walletData?.address}
                        tooltipLabel="Copiar !"
                      />
                      <ExternalLink
                        iconClassName="h-5 w-5"
                        tooltipLabel="Consultar en CardanoScan Preview"
                        externalURL={
                          'https://preview.cardanoscan.io/address/' + walletData?.address
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-xl text-amber-400">
                        {showAddress ? (
                          <>
                            {walletData
                              ? (parseInt(walletData?.balance) / 1000000).toFixed(4)
                              : '0'}{' '}
                            ADA
                          </>
                        ) : (
                          <>********</>
                        )}
                      </p>
                      <Tooltip text={showAddress ? 'Ocultar Saldo' : 'Mostrar Saldo'}>
                        <div onClick={handleShowAddress}>
                          {showAddress ? (
                            <EyeIcon className="h-6 w-6 cursor-pointer" />
                          ) : (
                            <EyeOffIcon className="h-6 w-6 cursor-pointer" />
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          <div className="h-fit w-full">
            <Transactions txPerPage={8} />
          </div>
        </div>
      </div>
    </>
  );
}
