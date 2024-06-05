import { ExternalLinkIcon } from '../icons/ExternalLinkIcon';
import Tooltip from '../common/Tooltip';

interface CopyToClipboard {
  className?: string;
  iconClassName: string;
  externalURL: string;
  tooltipLabel: string;
}

export default function ExternalLink(props: CopyToClipboard) {
  const { className, iconClassName, externalURL, tooltipLabel } = props;

  return (
    <Tooltip text={tooltipLabel}>
      <a
        href={externalURL}
        target="_blank"
        className={`cursor-pointer ${className}`}
      >
        <ExternalLinkIcon className={`${iconClassName}`} />
      </a>
    </Tooltip>
  );
}
