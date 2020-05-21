import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { Provider as ReduxProvider } from "react-redux";

import store from "slices/store";

import "App.scss";
import NavBar from "components/general/Navbar/Navbar";
import Greeting from "components/general/Greeting/Greeting";
import Footer from "components/general/Footer/Footer";

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
            <Footer />
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
