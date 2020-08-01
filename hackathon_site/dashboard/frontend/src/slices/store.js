import { combineReducers } from "redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import userReducer, { userReducerName } from "slices/users/userSlice";
import uiReducer, { uiReducerName } from "slices/ui/uiSlice";

const rootReducer = (history) =>
    combineReducers({
        [userReducerName]: userReducer,
        [uiReducerName]: uiReducer,
        router: connectRouter(history),
    });

export const history = createBrowserHistory();

export const store = configureStore({
    reducer: rootReducer(history),
    middleware: [...getDefaultMiddleware(), routerMiddleware(history)],
});

export default store;
