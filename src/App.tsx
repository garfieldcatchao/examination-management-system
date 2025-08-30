import React from "react";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";
import router from "./router";
import store from "./store";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
