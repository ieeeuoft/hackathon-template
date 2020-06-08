import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Route } from "react-router-dom";
import {
    createMuiTheme,
    StylesProvider,
    ThemeProvider,
} from "@material-ui/core/styles";
import { Provider as ReduxProvider } from "react-redux";
import styles from "assets/abstracts/_exports.scss";

import store, { history } from "slices/store";

import "App.scss";
import Dashboard from "pages/Dashboard/Dashboard";
import Footer from "components/general/Footer/Footer";
import Login from "pages/Login/Login";

export const makePalette = () => {
    // In testing, the scss exports don't work so styles is an
    // empty object. This gets around that.
    let palette = {};
    if (styles.primary) palette.primary = { main: styles.primary };
    if (styles.secondary) palette.secondary = { main: styles.secondary };
    return palette;
};

const theme = createMuiTheme({
    palette: makePalette(),
});

const UnconnectedApp = () => {
    return (
        <div className="App">
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/login" component={Login} />
            <Footer />
        </div>
    );
};

const ConnectedApp = () => (
    <ReduxProvider store={store}>
        <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
                <ConnectedRouter history={history}>
                    <UnconnectedApp />
                </ConnectedRouter>
            </ThemeProvider>
        </StylesProvider>
    </ReduxProvider>
);

export default ConnectedApp;
