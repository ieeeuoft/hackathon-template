import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import {
    render as rtlRender,
    RenderOptions as RtlRenderOptions,
} from "@testing-library/react";

import { makeStore, RootStore, RootState } from "slices/store";
import { DeepPartial } from "redux";
import { SnackbarProvider } from "notistack";
import { AxiosResponse } from "axios";
import { APIListResponse, Category, Hardware } from "api/types";
import { get } from "api/api";
import { getHardwareWithFilters } from "slices/hardware/hardwareSlice";
import { getCategories } from "slices/hardware/categorySlice";

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
    const wrapper = ({ children }: any) => (
        <Provider store={store}>
            <SnackbarProvider>
                <BrowserRouter>{children}</BrowserRouter>
            </SnackbarProvider>
        </Provider>
    );
    return rtlRender(ui, { wrapper, ...renderOptions });
};

// Re-export everything from rtl
export * from "@testing-library/react";

// Override render method
export { customRender as render };

export const promiseResolveWithDelay = <T extends unknown>(
    value: T,
    ms: number = 500
): Promise<T> =>
    new Promise((resolve) => {
        setTimeout(() => resolve(value), ms);
    });

export const makeMockApiListResponse = <T extends unknown>(
    data: T[],
    next?: string | null,
    previous?: string | null,
    count?: number
): AxiosResponse<APIListResponse<T>> =>
    ({
        data: {
            count: count ?? data.length,
            results: data,
            next: next || null,
            previous: previous || null,
        },
    } as AxiosResponse<APIListResponse<T>>);

// Re-export everything from jest-when
export * from "jest-when";

export interface StoreEntities {
    hardware?: Hardware[];
    categories?: Category[];
}

/**
 * Given a store, a collection of entities, and a mocked api.get function,
 * prepopulate the store by emulating API responses.
 *
 * Due to the asynchronous nature of dispatches, tests using this function
 * may need to wait after calling it for the store to be populated.
 */
export const fillStoreWithEntities = (
    store: RootStore,
    entities: StoreEntities,
    mockedGet: jest.MockedFunction<typeof get>
) => {
    if (entities.hardware) {
        const data = makeMockApiListResponse(entities.hardware);
        mockedGet.mockResolvedValueOnce(data);

        store.dispatch(getHardwareWithFilters());
    }

    if (entities.categories) {
        const data = makeMockApiListResponse(entities.categories);
        mockedGet.mockResolvedValueOnce(data);

        store.dispatch(getCategories());
    }

    mockedGet.mockReset();
};
