import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";
import NavBar from "components/general/Navbar/Navbar";
import "App.scss";
import DashCard from "components/dashboard/DashCard/DashCard.js";

function App() {
    const test = [
        {
          name: "chair",
          url: 5,
          icon: 45.99
        },
        {
          name: "table",
          url: 10,
          icon: 123.75
        },
        {
          name: "sofa",
          url: 2,
          icon: 399.50
        }
      ];

    return (
        <div className="App">
            <StylesProvider injectFirst>
                <Router>
                    <NavBar />
                </Router>
                <div className="App-header">
                    <p>IEEeeeeeee</p>
                    <DashCard title="name" list={test}/>
                </div>
            </StylesProvider>
        </div>
    );
}

export default App;
