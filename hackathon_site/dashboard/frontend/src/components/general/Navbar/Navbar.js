import React, { PureComponent } from 'react'
import styles from './Navbar.module.scss';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from './../../../logo.svg';
import { Home, ShoppingCart, Notifications, ListAlt, AccountCircle, InsertChartOutlined } from '@material-ui/icons';
import { ReactComponent as Inventory } from './../../../assets/images/icons/Hardware.svg';
import { IconButton, AppBar, Toolbar, Typography } from '@material-ui/core';

export default class Navbar extends PureComponent {
	render() {
		return (
			<AppBar className={styles.nav}>
          		<Toolbar>
					<Logo className={styles.navLogo}/>
            		<Typography variant="h6">Hello??</Typography>

					<div className={styles.navIcons}>
						<Link to={'/orders'}>
							<IconButton color="inherit" aria-label="Orders">
								<ListAlt/>
								<span>Orders</span>
							</IconButton>
						</Link>

						<Link to={'/teams'}>
							<IconButton color="inherit" aria-label="Teams">
								<AccountCircle/> Teams
							</IconButton>
						</Link>

						<Link to={'/reports'}>
							<IconButton color="inherit" aria-label="Reports">
								<InsertChartOutlined/> Reports
							</IconButton>
						</Link>

						<Link to={'/inventory'}>
							<IconButton color="inherit" aria-label="Inventory">
								<Inventory /> Inventory
							</IconButton>
						</Link>

						<Link to={'/cart'}>
							<IconButton color="inherit" aria-label="Cart">
								<ShoppingCart /> Cart
							</IconButton>
						</Link>

						<IconButton color="inherit" aria-label="Notifications">
							<Notifications /> Notifications
						</IconButton>

						
						
					</div>
          		</Toolbar>
			</AppBar>

			// <header className={styles.header}>
			
			// </header>
        )
    }
}
