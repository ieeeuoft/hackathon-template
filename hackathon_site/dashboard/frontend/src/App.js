import React, { useEffect } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

import store from "slices/store";
import { userDataSelector, fetchUserData } from "slices/users/userSlice";
import CircularProgress from "@material-ui/core/CircularProgress";

import "App.scss";
import NavBar from "components/general/Navbar/Navbar";

const Greeting = ({ userID }) => {
    // Example component connected to the redux store.
    // Could also be using connect() instead of useDispatch and useSelector:
    // https://react-redux.js.org/api/connect
    const dispatch = useDispatch();
    const { data, isLoading, errors } = useSelector(userDataSelector);

    useEffect(() => {
        dispatch(fetchUserData(userID));
    }, [dispatch, userID]);

    if (isLoading) return <CircularProgress />;
    if (errors) return <p>Something went wrong.</p>;
    if (data) return <p>Hello, {data.name}.</p>;

    return null;
};

const UnconnectedApp = () => {
    return (
        <div className="App">
            <Router>
                <NavBar />
            </Router>
            <div className="App-header">
                <p>IEEeeeeeee</p>
                <Greeting userID={1} />
            </div>
        </div>
    );
};

const ConnectedApp = () => (
    <ReduxProvider store={store}>
        <StylesProvider injectFirst>
            <UnconnectedApp />
        </StylesProvider>
    </ReduxProvider>
);

export default ConnectedApp;
