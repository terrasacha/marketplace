import { createContext, useState } from "react";

type ContextValues = {
  notification: null;
  showNotification: (notificationData: object) => void;
  hideNotification: () => void;
};

const defaultValue = {
  notification: null,
  showNotification: (notificationData: object) => {},
  hideNotification: () => {},
};

const NotificationContext = createContext<ContextValues>(defaultValue);

export function NotificationContextProvider(props: any) {
  const [activeNotification, setActiveNotification] = useState(null);

  async function walletFilter(
    rewardAddresses: string[],
    filterFunction: (stakeAddress: string) => Promise<boolean>
  ): Promise<string[]> {
    const promisesAddresses = rewardAddresses.map(filterFunction);
    const results = await Promise.all(promisesAddresses);
    return rewardAddresses.filter((_: any, index: any) => results[index]);
  }

  async function showNotificationHandler(notificationData: any) {
    setActiveNotification(notificationData);
  }

  function hideNotificationHandler() {
    setActiveNotification(null);
  }

  const context: ContextValues = {
    notification: activeNotification,
    showNotification: showNotificationHandler,
    hideNotification: hideNotificationHandler,
  };

  return (
    <NotificationContext.Provider value={context}>
      {props.children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
