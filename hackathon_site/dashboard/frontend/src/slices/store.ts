import { combineReducers, DeepPartial, StateFromReducersMapObject } from "redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory, History } from "history";

import userReducer, { userReducerName } from "slices/users/userSlice";
import uiReducer, { uiReducerName } from "slices/ui/uiSlice";
import hardwareReducer, { hardwareReducerName } from "slices/hardware/hardwareSlice";

export const history = createBrowserHistory();

const reducers = {
    [hardwareReducerName]: hardwareReducer,
    [userReducerName]: userReducer,
    [uiReducerName]: uiReducer,
    router: connectRouter(history),
};

const reducer = combineReducers(reducers);

export const makeStore = (preloadedState?: DeepPartial<RootState>) =>
    configureStore({
        reducer,
        middleware: [...getDefaultMiddleware(), routerMiddleware(history)],
        preloadedState,
    });

export const store = makeStore();

export default store;

export type RootState = StateFromReducersMapObject<typeof reducers>;
