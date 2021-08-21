import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { makeStore } from "slices/store";

export const withRouter = (component: React.ComponentElement<any, any>) => (
    <BrowserRouter>{component}</BrowserRouter>
);

export const withStore = (
    component: React.ComponentElement<any, any>,
    store = makeStore()
) => <Provider store={store}>{component}</Provider>;

export const withStoreAndRouter = (
    component: React.ComponentElement<any, any>,
    store = makeStore()
) => withStore(withRouter(component), store);
