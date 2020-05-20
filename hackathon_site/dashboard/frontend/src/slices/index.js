import { combineReducers } from "redux";

import userReducer, { userReducerName } from "slices/users/userSlice";

const rootReducer = combineReducers({
    [userReducerName]: userReducer,
});

export default rootReducer;
