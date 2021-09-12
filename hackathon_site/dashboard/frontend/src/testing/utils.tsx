import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import {
    render as rtlRender,
    RenderOptions as RtlRenderOptions,
} from "@testing-library/react";

import { makeStore, RootStore, RootState } from "slices/store";
import { DeepPartial } from "redux";

export const withRouter = (component: React.ComponentElement<any, any>) => (
    <BrowserRouter>{component}</BrowserRouter>
);

export const withStore = (
    component: React.ComponentElement<any, any>,
    store: RootStore = makeStore()
) => <Provider store={store}>{component}</Provider>;

export const withStoreAndRouter = (
    component: React.ComponentElement<any, any>,
    store: RootStore = makeStore()
) => withStore(withRouter(component), store);

interface RenderOptions {
    preloadedState?: DeepPartial<RootState>;
    store?: RootStore;
    options?: Omit<RtlRenderOptions, "queries">;
}

const customRender = (
    ui: React.ReactElement,
    {
        preloadedState = {},
        store = makeStore(preloadedState),
        ...renderOptions
    }: RenderOptions = {}
) => {
    const wrapper = ({ children }: any) => withStoreAndRouter(children, store);
    return rtlRender(ui, { wrapper, ...renderOptions });
};

// Re-export everything from rtl
export * from "@testing-library/react";

// Override render method
export { customRender as render };
