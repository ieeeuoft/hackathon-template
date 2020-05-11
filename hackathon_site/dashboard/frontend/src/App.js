import React from "react";
import "App.scss";
import { HashRouter as Router, Route } from "react-router-dom";
import NavBar from "components/general/Navbar/Navbar";

function App() {
    return (
        <div className="App">
            <Router>
                <NavBar />
            </Router>
            <div className="App-header">
                <p>IEEeeeeeee</p>
            </div>
        </div>
    );
}

export default App;
