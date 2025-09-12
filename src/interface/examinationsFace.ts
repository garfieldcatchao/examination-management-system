export interface ExaminationBtns {
  [key: string]: {
    label: string;
    icon: string;
    color?: string;
    active?: { backgroundColor?: string; color?: string; border?: string };
    normal?: { backgroundColor?: string; color?: string; border?: string };
    actionType?: string;
  }[];
}
