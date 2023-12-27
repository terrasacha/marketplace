import styles from './ui-lib.module.css';

/* eslint-disable-next-line */
export interface UiLibProps {
  className?: string;
}

export function UiLib(props: UiLibProps) {
  return (
    <div /* className={styles['container']} */ className={props.className}>
      <h1>Welcome to UiLib!</h1>
    </div>
  );
}

export default UiLib;
