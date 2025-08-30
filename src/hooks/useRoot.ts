import { useContext } from "react";
import { useSelector, Selector } from "react-redux";
import { UseRootReturn } from "../interface/contextFace";
import { RootContext } from "../context";

export const useRoot = <T extends object>(): UseRootReturn<T> => {
  
  const context = useContext(RootContext);
  if (!context) {
    throw new Error('useRoot must be used within a RootProvider');
  }

  const { store, contextValue } = context;
 
  // 提供 useSelector 的快捷方式
  const useRedux = <R>(selector: Selector<any, R>): R => useSelector(selector);
 
  return {
    store,
    contextValue,
    useRedux,
  };
};
