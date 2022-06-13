import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { DeepPartial } from "@reduxjs/toolkit";
import {
    render as rtlRender,
    RenderOptions as RtlRenderOptions,
} from "@testing-library/react";

import { makeStore, RootStore, RootState } from "slices/store";
import { SnackbarProvider } from "notistack";
import { AxiosResponse } from "axios";
import { APIListResponse, CartItem, Category, Hardware, OrderInTable } from "api/types";
import {
    hardwareReducerName,
    HardwareState,
    initialState as hardwareInitialState,
} from "slices/hardware/hardwareSlice";
import {
    categoryReducerName,
    CategoryState,
    initialState as categoryInitialState,
} from "slices/hardware/categorySlice";

import { uiReducerName, UIState } from "slices/ui/uiSlice";
import {
    cartReducerName,
    CartState,
    initialState as cartItemInitialState,
} from "slices/hardware/cartSlice";

import { teamReducerName, TeamState } from "slices/event/teamSlice";
import {
    initialState as orderInitialState,
    orderReducerName,
    OrderState,
} from "slices/order/orderSlice";

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

export const makeMockApiResponse = (data: object, status?: number): AxiosResponse => ({
    config: {},
    headers: {},
    status: status ?? 200,
    statusText: "OK",
    data,
});

// Re-export everything from jest-when
export * from "jest-when";

export interface StoreEntities {
    hardware?: Hardware[];
    hardwareState?: Partial<HardwareState>;
    categories?: Category[];
    ui?: DeepPartial<UIState>;
    cartItems?: CartItem[];
    team?: DeepPartial<TeamState>;
    cartState?: DeepPartial<CartState>;
    orderState?: Partial<OrderState>;
    pendingOrders?: OrderInTable[];
}

export const makeStoreWithEntities = (entities: StoreEntities) => {
    const preloadedState: DeepPartial<RootState> = {};
    if (entities.hardware) {
        const hardwareState: HardwareState = {
            ...hardwareInitialState,
            ...entities.hardwareState,
            ids: [],
            entities: {},
        };

        for (const hardware of entities.hardware) {
            hardwareState.ids.push(hardware.id);
            hardwareState.entities[hardware.id] = hardware;
        }

        preloadedState[hardwareReducerName] = hardwareState;
    } else if (entities.hardwareState) {
        preloadedState[hardwareReducerName] = {
            ...hardwareInitialState,
            ...entities.hardwareState,
        };
    }

    if (entities.categories) {
        const categoryState: CategoryState = {
            ...categoryInitialState,
            ids: [],
            entities: {},
        };

        for (const category of entities.categories) {
            categoryState.ids.push(category.id);
            categoryState.entities[category.id] = category;
        }

        preloadedState[categoryReducerName] = categoryState;
    }

    if (entities.ui) {
        preloadedState[uiReducerName] = entities.ui;
    }

    if (entities.cartItems) {
        const cartItemState: CartState = {
            ...cartItemInitialState,
            ...entities.cartState,
            ids: [],
            entities: {},
        };
        for (const cartItem of entities.cartItems) {
            cartItemState.ids.push(cartItem.hardware_id);
            cartItemState.entities[cartItem.hardware_id] = cartItem;
        }

        preloadedState[cartReducerName] = cartItemState;
    }

    if (entities.team) {
        preloadedState[teamReducerName] = entities.team;
    }

    if (entities.orderState) {
        preloadedState[orderReducerName] = {
            ...orderInitialState,
            ...entities.orderState,
        };
    }

    if (entities.pendingOrders) {
        const orderState: OrderState = {
            ...orderInitialState,
            ...entities.orderState,
            ids: [],
            entities: {},
        };

        for (const order of entities.pendingOrders) {
            orderState.ids.push(order.id);
            orderState.entities[order.id] = order;
        }

        preloadedState[orderReducerName] = orderState;
    }

    return makeStore(preloadedState);
};
