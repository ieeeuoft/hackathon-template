import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Route, Redirect, Switch } from "react-router-dom";
import {
    createMuiTheme,
    StylesProvider,
    ThemeProvider,
} from "@material-ui/core/styles";
import { Provider as ReduxProvider } from "react-redux";
import { SnackbarProvider } from "notistack";

import styles from "assets/abstracts/_exports.scss";
import store, { history } from "slices/store";

import "App.scss";
import Dashboard from "pages/Dashboard/Dashboard";
import Footer from "components/general/Footer/Footer";
import Login from "pages/Login/Login";
import Orders from "pages/Orders/Orders";
import Teams from "pages/Teams/Teams";
import Reports from "pages/Reports/Reports";
import Inventory from "pages/Inventory/Inventory";
import Cart from "pages/Cart/Cart";
import IncidentForm from "pages/IncidentForm/IncidentForm";
import NotFound from "pages/NotFound/NotFound";
import SnackbarNotifier from "components/general/SnackbarNotifier/SnackbarNotifier";

import { displaySnackbar as displaySnackbarAction } from "slices/ui/uiSlice";
import { useDispatch } from "react-redux";

const SnackButton = () => {
    const dispatch = useDispatch();

    const displaySnackbar = (...args) => {
        dispatch(displaySnackbarAction(...args));
    };

    return (
        <button
            onClick={() => {
                displaySnackbar({
                    message: "Hello there! ",
                    options: {
                        variant: "success",
                    },
                });
            }}
        >
            Dispatch a snackbar
        </button>
    );
};

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
            <div className="AppPadding">
                <Switch>
                    <Route exact path="/" component={Dashboard} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/orders" component={Orders} />
                    <Route exact path="/teams" component={Teams} />
                    <Route exact path="/reports" component={Reports} />
                    <Route exact path="/inventory" component={Inventory} />
                    <Route exact path="/cart" component={Cart} />
                    <Route exact path="/incident-form" component={IncidentForm} />
                    <Route exact path="/404" component={NotFound} />
                    <Redirect to="/404" />
                </Switch>
                <SnackButton />
            </div>
            <Footer />
        </div>
    );
};

const ConnectedApp = () => (
    <ReduxProvider store={store}>
        <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <SnackbarNotifier />
                    <ConnectedRouter history={history}>
                        <UnconnectedApp />
                    </ConnectedRouter>
                </SnackbarProvider>
            </ThemeProvider>
        </StylesProvider>
    </ReduxProvider>
);

export default ConnectedApp;
