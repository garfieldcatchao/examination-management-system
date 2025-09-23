import { PayloadAction } from "@reduxjs/toolkit";
import { ChooiceIdentityType, LoginState,  } from "../interface/loginFace";

export const loginReducer = (state: LoginState, action: PayloadAction<any>) => {
  return {
    ...state,
    ...action.payload,
  };
};

export const modificationReducer = (state: LoginState, action: any) => {
  return state; // 暂时返回原state
};
