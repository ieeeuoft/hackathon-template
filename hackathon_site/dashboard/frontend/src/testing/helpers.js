import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { store as ourStore } from "slices/store";

export const withRouter = (component) => <BrowserRouter>{component}</BrowserRouter>;

export const withStore = (component, store = ourStore) => (
    <Provider store={store}>{component}</Provider>
);

export const withStoreAndRouter = (component, store = ourStore) =>
    withStore(withRouter(component), store);
