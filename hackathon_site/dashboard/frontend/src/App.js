import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
    createMuiTheme,
    StylesProvider,
    ThemeProvider,
} from "@material-ui/core/styles";
import { Provider as ReduxProvider } from "react-redux";
import styles from "assets/abstracts/_exports.scss";

import store from "slices/store";

import "App.scss";
import Dashboard from "pages/Dashboard/Dashboard";
import Footer from "components/general/Footer/Footer";
import Login from "pages/Login/Login";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: styles.primary,
        },
        secondary: {
            main: styles.secondary,
        },
    },
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
                <Router>
                    <UnconnectedApp />
                </Router>
            </ThemeProvider>
        </StylesProvider>
    </ReduxProvider>
);

export default ConnectedApp;
