import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Route, Redirect, Switch } from "react-router-dom";
import { createTheme, StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { SnackbarProvider } from "notistack";

import styles from "assets/abstracts/_exports.scss";
import store, { history } from "slices/store";

import "App.scss";
import AdminDashboard from "pages/AdminDashboard/AdminDashboard";
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
import withUserCheck from "components/HOCs/withUserCheck/withUserCheck";
import TeamDetail from "pages/TeamDetail/TeamDetail";
import Acknowledgement from "pages/Acknowledgement/Acknowledgement";

type Palette = {
    primary?: { main: string };
    secondary?: { main: string };
};

export const makePalette = (): Palette => {
    // In testing, the scss exports don't work so styles is an
    // empty object. This gets around that.
    let palette: Palette = {};
    if (styles.primary) palette.primary = { main: styles.primary };
    if (styles.secondary) palette.secondary = { main: styles.secondary };
    return palette;
};

const theme = createTheme({
    palette: makePalette(),
});

const persistor = persistStore(store);

const UnconnectedApp = () => {
    return (
        <div className="App">
            <div className="AppPadding">
                <Switch>
                    <Route
                        exact
                        path="/"
                        component={withUserCheck("both", Dashboard, AdminDashboard)}
                    />
                    <Route exact path="/login" component={Login} />
                    <Route
                        exact
                        path="/orders"
                        component={withUserCheck("admin", Orders)}
                    />
                    <Route
                        exact
                        path="/teams"
                        component={withUserCheck("admin", Teams)}
                    />
                    <Route
                        exact
                        path="/teams/:code"
                        component={withUserCheck("admin", TeamDetail)}
                    />
                    <Route
                        exact
                        path="/reports"
                        component={withUserCheck("admin", Reports)}
                    />
                    <Route
                        exact
                        path="/inventory"
                        component={withUserCheck("both", Inventory)}
                    />
                    <Route
                        exact
                        path="/cart"
                        component={withUserCheck("participant", Cart)}
                    />
                    <Route
                        exact
                        path="/incident-form"
                        component={withUserCheck("both", IncidentForm)}
                    />
                    <Route
                        exact
                        path="/acknowledgement"
                        component={withUserCheck("onboard", Acknowledgement)}
                    />
                    <Route exact path="/404" component={NotFound} />
                    <Redirect to="/404" />
                </Switch>
            </div>
            <Footer />
        </div>
    );
};

const ConnectedApp = () => (
    <ReduxProvider store={store}>
        <PersistGate persistor={persistor}>
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
        </PersistGate>
    </ReduxProvider>
);

export default ConnectedApp;
