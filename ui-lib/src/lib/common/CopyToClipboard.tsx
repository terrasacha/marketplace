import { CopyCheckIcon } from '../icons/CopyCheckIcon';
import {  CopyIcon } from '../icons/CopyIcon';
import Tooltip  from '../common/Tooltip';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopyToClipboard {
  className?: string;
  iconClassName: string;
  copyValue: string;
  tooltipLabel: string
}

export default function CopyToClipboard(props: CopyToClipboard) {

  const { className, iconClassName, copyValue, tooltipLabel } = props
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyValue = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setIsCopied(true);
      toast.success('Copiado !');

      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <Tooltip text={tooltipLabel}>
      <div className={`cursor-pointer ${className}`} onClick={handleCopyValue}>
        {isCopied ? (
          <CopyCheckIcon className={`hover:text-blue-600 ${iconClassName}`} />
        ) : (
          <CopyIcon className={`hover:text-blue-600 ${iconClassName}`} />
        )}
      </div>
    </Tooltip>
  );
}
