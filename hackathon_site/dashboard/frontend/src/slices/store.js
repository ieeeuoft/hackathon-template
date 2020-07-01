import { combineReducers } from "redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import userReducer, { userReducerName } from "slices/users/userSlice";

const rootReducer = (history) =>
    combineReducers({
        [userReducerName]: userReducer,
        router: connectRouter(history),
    });

export const history = createBrowserHistory();

const store = configureStore({
    reducer: rootReducer(history),
    middleware: [...getDefaultMiddleware(), routerMiddleware(history)],
});

export default store;
