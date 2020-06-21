import { combineReducers } from "redux";

import userReducer, { userReducerName } from "slices/users/userSlice";
import {
    dashboardReducerName,
    reducer as dashboardReducer,
} from "slices/dashboard/dashboardSlice";

const rootReducer = combineReducers({
    [userReducerName]: userReducer,
    [dashboardReducerName]: dashboardReducer,
});

export default rootReducer;
