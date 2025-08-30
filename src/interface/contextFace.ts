import { ReactNode } from "react";
import { Selector } from "react-redux";
import type { Store } from "@reduxjs/toolkit";

export interface RootContextValueFace<T extends object> {
  store: Store<any, any>;
  contextValue: T;
}


export interface RootProviderProps<T extends object> {
  store: Store<any, any>;
  contextValue?: T;
  children: ReactNode;
}

export interface UseRootReturn<T extends object> {
  store: Store<any, any>;
  contextValue: T;
  useRedux: <R>(selector: Selector<any, R>) => R;
}