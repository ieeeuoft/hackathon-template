import React from "react";
import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from '@material-ui/icons/FilterList';
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

            <Hidden implementation="css" smDown>
                <InventoryFilter
                    categories={categories}
                    applyFilter={applyFilter}
                    removeFilter={removeFilter}
                />
            </Hidden>

            <Hidden implementation="css" smUp>
                <Button
                        aria-label="Orders"
                        startIcon={<FilterListIcon />}
                        onClick={toggleMenu}
                    >
                    Filter
                </Button>
            </Hidden>
            
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
