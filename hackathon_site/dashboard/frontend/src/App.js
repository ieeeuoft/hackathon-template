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
import Login from "pages/login/Login";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";

const testD = {
    name: "Arduino",
    type: "red",
    total: 30,
    available: 29,
    img: "https://www.filterforge.com/more/help/images/size200.jpg",
    tags: "MCU, FPGA",
    manufacturer: "Canakit",
    model_num: "Model 3B+",
    datasheet: "link",
    notes: ["- For micropython ask for image", "- randomnerdtutorials.com"],
    constraints: ["- Max 1 of this item", "- Max 3 microcontroller labelled red"],
    quantity: 3,
};

const testF = (qty) => {
    alert(qty);
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
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/login" component={Login} />
            <SideSheetRight detail={testD} addCartFunction={testF} />
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
