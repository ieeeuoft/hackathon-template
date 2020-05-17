import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import NavBar from "components/general/Navbar/Navbar";
import Dashboard from "pages/Dashboard/Dashboard";
import "App.scss";

function App() {
    return (
        <div className="App">
            <StylesProvider injectFirst>
                <Router>
                    <NavBar />
                    <Route exact path="/" component={Dashboard} />
                </Router>
            </StylesProvider>
        </div>
    );
}

export default App;
