import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import NavBar from "components/general/Navbar/Navbar";
import Footer from "components/general/Footer/Footer";
import "App.scss";

function App() {
    return (
        <div className="App">
            <StylesProvider injectFirst>
                <Router>
                    <NavBar />
                </Router>
                <div className="App-header">
                    <p>IEEeeeeeee</p>
                </div>
            </StylesProvider>
            <Footer />
        </div>
    );
}

export default App;
