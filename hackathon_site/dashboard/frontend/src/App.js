import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { Provider, Provider as ReduxProvider } from "react-redux";

import store from "slices/store";

import "App.scss";
import NavBar from "components/general/Navbar/Navbar";

const UnconnectedApp = () => {
    return (
        <div className="App">
            <Router>
                <NavBar />
            </Router>
            <div className="App-header">
                <p>IEEeeeeeee</p>
            </div>
        </div>
    );
};

const ConnectedApp = () => (
    <Provider store={store}>
        <StylesProvider injectFirst>
            <UnconnectedApp />
        </StylesProvider>
    </Provider>
);

export default ConnectedApp;
