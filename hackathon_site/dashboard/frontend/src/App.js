import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import NavBar from "components/general/Navbar/Navbar";
import "App.scss";
import DashCard from "components/dashboard/DashCard/DashCard.js";

function App() {
    return (
        <div className="App">
            <StylesProvider injectFirst>
                <Router>
                    <NavBar />
                </Router>
                <div className="App-header">
                    <p>IEEeeeeeee</p>
                    <DashCard />
                </div>
            </StylesProvider>
        </div>
    );
}

export default App;
