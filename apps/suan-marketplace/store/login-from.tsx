import { createContext, useMemo, useState } from "react";

const LoginFromContext = createContext({});

export interface LoginFromInterface {
  loginFromRoot: boolean;
}

export function LoginFromContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loginFromRoot, setLoginFromRoot] = useState<LoginFromInterface>({
    loginFromRoot: false,
  });

  const handleLoginFrom = async (data: LoginFromInterface) => {
    setLoginFromRoot(data);
  };
  const contextProps = useMemo(
    () => ({ loginFromRoot, handleLoginFrom }),
    [loginFromRoot]
  );

  return (
    <LoginFromContext.Provider value={contextProps}>
      {children}
    </LoginFromContext.Provider>
  );
}

export default LoginFromContext;
