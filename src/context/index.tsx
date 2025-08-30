import { createContext } from "react";
import {
  RootContextValueFace,
  RootProviderProps,
} from "../interface/contextFace";

export const RootContext = createContext<RootContextValueFace<any> | undefined>(
  undefined
);

export const RootProvider = <T extends object>({
  store,
  contextValue,
  children,
}: RootProviderProps<T>) => {
  return (
    <RootContext.Provider value={{ store, contextValue }}>
      {children}
    </RootContext.Provider>
  );
};
