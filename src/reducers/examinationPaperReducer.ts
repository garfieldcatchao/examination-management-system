import { PayloadAction } from "@reduxjs/toolkit";
import { ExaminationPaperState } from "../interface/examinationPaperFace";

export const setSelectedTabReducer = (
  state: ExaminationPaperState,
  action: PayloadAction<any>
) => {
  return {
    ...state,
    activeTab: action.payload,
  };
};
