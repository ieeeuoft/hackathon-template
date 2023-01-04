import { combineReducers, StateFromReducersMapObject } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import storage from "redux-persist/lib/storage";
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";

import userReducer, { userReducerName } from "slices/users/userSlice";
import uiReducer, { uiReducerName } from "slices/ui/uiSlice";
import hardwareReducer, { hardwareReducerName } from "slices/hardware/hardwareSlice";
import orderReducer, { orderReducerName } from "slices/order/orderSlice";
import categoryReducer, { categoryReducerName } from "slices/hardware/categorySlice";
import cartReducer, { cartReducerName } from "slices/hardware/cartSlice";
import teamReducer, { teamReducerName } from "slices/event/teamSlice";
import teamAdminReducer, { teamAdminReducerName } from "slices/event/teamAdminSlice";
import teamDetailReducer, { teamDetailReducerName } from "slices/event/teamDetailSlice";
import teamOrderReducer, { teamOrderReducerName } from "slices/order/teamOrderSlice";
import adminOrderReducer, { adminOrderReducerName } from "slices/order/adminOrderSlice";

export const history = createBrowserHistory();

const reducers = {
    [cartReducerName]: cartReducer,
    [teamReducerName]: teamReducer,
    [teamOrderReducerName]: teamOrderReducer,
    [teamDetailReducerName]: teamDetailReducer,
    [categoryReducerName]: categoryReducer,
    [hardwareReducerName]: hardwareReducer,
    [orderReducerName]: orderReducer,
    [userReducerName]: userReducer,
    [uiReducerName]: uiReducer,
    [teamAdminReducerName]: teamAdminReducer,
    [adminOrderReducerName]: adminOrderReducer,
    router: connectRouter(history),
};

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["cart"],
};

const reducer = combineReducers(reducers);
const persistedReducer = persistReducer(persistConfig, reducer);

export const makeStore = (preloadedState?: any) =>
    configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            }).concat(routerMiddleware(history)),
        preloadedState,
    });

export const store = makeStore();

export default store;

export type RootState = StateFromReducersMapObject<typeof reducers>;
export type RootStore = typeof store;
export type AppDispatch = typeof store.dispatch;
