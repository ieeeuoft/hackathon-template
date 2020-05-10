import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { HashRouter as Router, Route } from 'react-router-dom';
import NavBar from './components/general/Navbar/Navbar';

function App() {
return (
	<div className="App">
		<Router>
			< NavBar />
		</Router>
		
		{/* <header className="App-header">
			<p>
			IEEeeeeee
			</p>
		</header> */}
	</div>
);
}

export default App;
