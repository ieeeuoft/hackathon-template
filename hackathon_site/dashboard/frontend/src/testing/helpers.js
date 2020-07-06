import React from "react";
import { BrowserRouter } from "react-router-dom/";
import { Provider } from "react-redux";

import store from "slices/store";

export const withRouter = (component) => <BrowserRouter>{component}</BrowserRouter>;

export const withStore = (component) => <Provider store={store}>{component}</Provider>;
