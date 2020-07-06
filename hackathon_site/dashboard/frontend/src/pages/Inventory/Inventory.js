import React from "react";
import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";
import CloseIcon from "@material-ui/icons/Close";
import RefreshIcon from '@material-ui/icons/Refresh';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import TextField from "@material-ui/core/TextField";
import { categories } from "testing/mockData";

const applyFilter = () => alert("Applies the filter");

const removeFilter = () => alert("Removes all filters and resets form");

const Inventory = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const toggleMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <div>
            <Header />
            <Typography variant="h1">Hardware Inventory</Typography>
            <p>IEEEEEE</p>

            <div className={styles.itemHeader}>
                <div className={styles.itemHeaderSearch}>
                    <TextField
                        className={styles.itemHeaderSearchInput}
                        id="searc-input"
                        label="Search items"
                        variant="outlined"
                    />
                    <IconButton
                        color="primary"
                        aria-label="Search"
                        variant="contained"
                    >
                        <SearchIcon />
                    </IconButton>
                </div>
                <Hidden implementation="css" smDown>
                    <Divider orientation="vertical" className={styles.itemHeaderDivider} flexItem/>
                </Hidden>
                <div className={styles.itemHeaderBtns}>
                    <Hidden implementation="css" smUp>
                        <Button
                                aria-label="Orders"
                                startIcon={<FilterListIcon />}
                                onClick={toggleMenu}
                            >
                            Filter
                        </Button>
                    </Hidden>
                    <div className={styles.itemHeaderBtnsRefresh}>
                        <Typography variant="body2">123 items.</Typography>
                        <IconButton
                            color="primary"
                            aria-label="refresh"
                            variant="contained"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </div>    
                </div>
            </div>

            {/* <Hidden implementation="css" smDown> */}
                <InventoryFilter
                    categories={categories}
                    applyFilter={applyFilter}
                    removeFilter={removeFilter}
                />
            {/* </Hidden> */}
            
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={toggleMenu}
            >
                <div>
                    {/* <Typography variant="h2">Filter</Typography> */}
                    <IconButton
                        color="inherit"
                        aria-label="CloseMenu"
                        onClick={toggleMenu}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <InventoryFilter
                    categories={categories}
                    applyFilter={applyFilter}
                    removeFilter={removeFilter}
                    elevation={0}
                />
            </Drawer>
        </div>    
    );
};

export default Inventory;
