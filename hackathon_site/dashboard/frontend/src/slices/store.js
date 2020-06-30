import { combineReducers } from "redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import userReducer, { userReducerName } from "slices/users/userSlice";
import dashboardReducer, {
    dashboardReducerName,
} from "slices/dashboard/dashboardSlice";

const rootReducer = (history) =>
    combineReducers({
        [userReducerName]: userReducer,
        [dashboardReducerName]: dashboardReducer,
        router: connectRouter(history),
    });

export const history = createBrowserHistory();

const store = configureStore({
    reducer: rootReducer(history),
    middleware: [...getDefaultMiddleware(), routerMiddleware(history)],
});

export default store;
