import { LoadingIcon } from '../icons/LoadingIcon';

interface LoadingOverlayProps {
  className?: string;
  iconClassName?: string;
  visible: boolean;
  children: React.ReactNode;
}

export default function LoadingOverlay(props: LoadingOverlayProps) {
  const { className, visible, children } = props;

  return (
    <div className={`relative z-40 ${visible && 'cursor-progress'}`}>
      {visible && (
        <div
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center py-10`}
        >
          <LoadingIcon className={`h-10 w-10`} />
        </div>
      )}
      <div className={`min-h-20 ${visible && 'blur-xs'} ${className}`}>{children}</div>
    </div>
  );
}
