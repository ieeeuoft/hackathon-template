import React from "react";
import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import Item from "components/inventory/Item/Item";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";
import RefreshIcon from '@material-ui/icons/Refresh';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import TextField from "@material-ui/core/TextField";
import SideSheetLeft from "components/general/SideSheetLeft/SideSheetLeft";
import Grid from "@material-ui/core/Grid";
import { categories, items } from "testing/mockData";

const applyFilter = () => alert("Applies the filter");

const removeFilter = () => alert("Removes all filters and resets form");

const Inventory = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const toggleMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            <Header />
            <Typography variant="h1">Hardware Inventory</Typography>
            {/* <p>IEEEEEE</p> */}
            <div className={styles.inventory}>
                <Hidden implementation="css" smDown>
                    <InventoryFilter
                        categories={categories}
                        applyFilter={applyFilter}
                        removeFilter={removeFilter}
                    />
                </Hidden>
                <div>
            {/* <div className={styles.itemHeader}> */}
                <Grid
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                    spacing={2}
                    className={styles.itemHeader}
                >
                    {/* <div className={styles.itemHeaderSearch}> */}
                    <Grid item style={{display: "flex"}} xs={12} sm={6}>
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
                    </Grid>
                    
                    <Divider orientation="vertical" sm={0} className={styles.itemHeaderDivider} flexItem/>{/*  */}
                    {/* <div className={styles.itemHeaderBtns}> */}
                    
                    {/* <div className={styles.itemHeaderBtnsRefresh}> */}
                    <Grid item style={{display: "flex", alignItems: "center"}} md={4}>
                        <Hidden implementation="css" smUp>
                            <Grid md={4} item>
                                <Button
                                        aria-label="Orders"
                                        startIcon={<FilterListIcon />}
                                        onClick={toggleMenu}
                                    >
                                    Filter
                                </Button>
                            </Grid>
                        </Hidden>

                        <Typography variant="body2">123 items.</Typography>
                        <IconButton
                            color="primary"
                            aria-label="refresh"
                            variant="contained"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid
                    container
                    direction="row"
                    spacing={2}
                    className={styles.itemGrid}
                    >
                    {items.map((itemH, i) => (
                        <Grid xs={6} sm={4} md={3} lg={2} className={styles.Item} item>
                            <Item image={itemH.image} title={itemH.title} total={itemH.total} currentStock={itemH.currentStock} />
                        </Grid>
                    ))}
                </Grid>   
            
                </div>
            </div>
            <SideSheetLeft title="Filter" toggleState={mobileOpen} toggleFunc={toggleMenu}>
                <InventoryFilter
                    categories={categories}
                    applyFilter={applyFilter}
                    removeFilter={removeFilter}
                    elevation={0}
                />
            </SideSheetLeft>
        </>    
    );
};

export default Inventory;
