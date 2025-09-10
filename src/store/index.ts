import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./loginStore";
import menuReducer from "./menuStore";
import testBaseManagementReducer from "./testbaseManagementStore";
import examinationPaperReducer from "./examinationPaperStore";
import examinationReducer from "./examinationStore";

const store = configureStore({
  reducer: {
    login: loginReducer,
    menu: menuReducer,
    testbaseManagement: testBaseManagementReducer,
    examinationPaper: examinationPaperReducer,
    examination: examinationReducer,
  },
});

export default store;
