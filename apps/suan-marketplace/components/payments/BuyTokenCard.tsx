'use client';

import { Card, TextInput } from 'flowbite-react';
import { TokenDetailSection } from './TokenDetailSection';
import { BlockChainIcon } from '../icons/BlockChainIcon';
import ProjectInfoContext from '@suan//store/projectinfo-context';
import { useContext } from 'react';

export function BuyTokenCard({
  tokenAmount,
  handleSetTokenAmount,
  validationError,
}: {
  tokenAmount: string;
  handleSetTokenAmount: (data: string) => void;
  validationError: string;
}) {
  const { projectInfo } = useContext<any>(ProjectInfoContext);

  return (
    <div>
      <Card>
        <TokenDetailSection
          projectName={projectInfo.projectName}
          tokenName={projectInfo.tokenName}
          tokenCurrency={projectInfo.tokenCurrency}
          creationDate={projectInfo.createdAt}
          availableAmount={projectInfo.availableAmount}
          tokenPrice={projectInfo.tokenPrice}
          tokenImageUrl={projectInfo.tokenImageUrl}
        />
        <div>
          <span>Cantidad de tokens:</span>
          <TextInput
            className="mt-2"
            addon={<BlockChainIcon className="h-5 w-5"></BlockChainIcon>}
            color={validationError && 'failure'}
            helperText={validationError && validationError}
            type="number"
            onChange={(e) => {
              handleSetTokenAmount(e.target.value);
            }}
            value={tokenAmount}
            required
          />
        </div>
      </Card>
    </div>
  );
}
