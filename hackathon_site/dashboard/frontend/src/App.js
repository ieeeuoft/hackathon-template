import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { Provider as ReduxProvider } from "react-redux";

import store from "slices/store";

import "App.scss";
import NavBar from "components/general/Navbar/Navbar";
import Greeting from "components/general/Greeting/Greeting";
import Dashboard from "pages/Dashboard/Dashboard";
import Footer from "components/general/Footer/Footer";
import SideSheetR from "components/general/SideSheetR/SideSheetR";

const testDetail = {
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

const UnconnectedApp = () => {
    return (
        <div className="App">
            <Router>
                <NavBar />
                <Route exact path="/" component={Dashboard} />
            </Router>
            <div className="App-header">
                <p>IEEeeeeeee</p>
                <SideSheetR detail={testDetail} />
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
