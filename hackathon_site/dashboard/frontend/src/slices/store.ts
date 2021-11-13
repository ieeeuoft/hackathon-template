import { combineReducers, StateFromReducersMapObject } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import userReducer, { userReducerName } from "slices/users/userSlice";
import uiReducer, { uiReducerName } from "slices/ui/uiSlice";
import hardwareReducer, { hardwareReducerName } from "slices/hardware/hardwareSlice";
import categoryReducer, { categoryReducerName } from "slices/hardware/categorySlice";
import cartReducer, { cartReducerName } from "slices/hardware/cartSlice";

export const history = createBrowserHistory();

const reducers = {
    [cartReducerName]: cartReducer,
    [categoryReducerName]: categoryReducer,
    [hardwareReducerName]: hardwareReducer,
    [userReducerName]: userReducer,
    [uiReducerName]: uiReducer,
    router: connectRouter(history),
};

const reducer = combineReducers(reducers);

export const makeStore = (preloadedState?: any) =>
    configureStore({
        reducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(routerMiddleware(history)),
        preloadedState,
    });

export const store = makeStore();

export default store;

export type RootState = StateFromReducersMapObject<typeof reducers>;
export type RootStore = typeof store;
export type AppDispatch = typeof store.dispatch;
