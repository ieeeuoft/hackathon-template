import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import RefreshIcon from "@material-ui/icons/Refresh";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from "@material-ui/icons/FilterList";
import InventorySearch from "components/inventory/InventorySearch/InventorySearch";
import CircularProgress from "@material-ui/core/CircularProgress";

import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import InventoryGrid from "components/inventory/InventoryGrid/InventoryGrid";
import ProductOverview from "components/inventory/ProductOverview/ProductOverview";

import {
    clearFilters,
    getHardwareWithFilters,
    getHardwareNextPage,
    hardwareCountSelector,
    hardwareSelectors,
    isMoreLoadingSelector,
    isLoadingSelector,
} from "slices/hardware/hardwareSlice";
import { getCategories } from "slices/hardware/categorySlice";
import { Grid } from "@material-ui/core";
import { userTypeSelector } from "slices/users/userSlice";
import DateRestrictionAlert from "components/general/DateRestrictionAlert/DateRestrictionAlert";

const Inventory = () => {
    const dispatch = useDispatch();
    const itemsInStore = useSelector(hardwareSelectors.selectTotal);
    const count = useSelector(hardwareCountSelector);
    const isMoreLoading = useSelector(isMoreLoadingSelector);
    const isLoading = useSelector(isLoadingSelector);
    const userType = useSelector(userTypeSelector);

    const [mobileOpen, setMobileOpen] = React.useState(false);
    const toggleFilter = () => {
        setMobileOpen(!mobileOpen);
    };

    const getMoreHardware = () => {
        dispatch(getHardwareNextPage());
    };

    const refreshHardware = () => {
        dispatch(getHardwareWithFilters());
    };

    // When the page is loaded, clear filters and fetch fresh inventory data
    useEffect(() => {
        dispatch(clearFilters());
        dispatch(getHardwareWithFilters());
        dispatch(getCategories());
    }, [dispatch]);

    return (
        <>
            <Header />
            <ProductOverview showAddToCartButton />
            <div className={styles.inventory}>
                <Drawer
                    className={styles.inventoryFilterDrawer}
                    open={mobileOpen}
                    onClose={toggleFilter}
                >
                    <div className={styles.inventoryFilterDrawerTop}>
                        <Typography variant="h2">Filters</Typography>
                        <IconButton
                            color="inherit"
                            aria-label="CloseFilter"
                            onClick={toggleFilter}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <InventoryFilter />
                </Drawer>

                <Typography variant="h1">Hardware Inventory</Typography>

                {userType === "participant" && <DateRestrictionAlert />}

                <Grid container spacing={2} className={styles.inventoryBody}>
                    <Grid item md={3} xl={2}>
                        <Hidden implementation="css" smDown>
                            <InventoryFilter />
                        </Hidden>
                    </Grid>

                    <Grid item md={9} xl={10}>
                        <div className={styles.inventoryBodyToolbar}>
                            <div className={styles.inventoryBodyToolbarDiv}>
                                <InventorySearch />
                            </div>

                            <Divider
                                orientation="vertical"
                                className={styles.inventoryBodyToolbarDivider}
                                flexItem
                            />

                            <div className={styles.inventoryBodyToolbarDiv}>
                                <Hidden implementation="css" mdUp>
                                    <Button
                                        aria-label="Filter"
                                        startIcon={<FilterListIcon color="primary" />}
                                        onClick={toggleFilter}
                                    >
                                        Filter
                                    </Button>
                                </Hidden>

                                <div className={styles.inventoryBodyToolbarRefresh}>
                                    <Typography variant="body2">
                                        {count} results
                                    </Typography>
                                    <IconButton
                                        color="primary"
                                        aria-label="Refresh"
                                        onClick={refreshHardware}
                                        data-testid="refreshInventory"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        <InventoryGrid />
                        {count > 0 && (
                            <Divider
                                className={styles.inventoryLoadDivider}
                                data-testid="inventoryCountDivider"
                            />
                        )}
                        <Typography
                            variant="subtitle2"
                            align="center"
                            paragraph
                            style={{ marginTop: count <= 0 ? "30px" : 0 }}
                        >
                            {count > 0
                                ? `SHOWING ${itemsInStore} OF ${count} ITEMS`
                                : isLoading
                                ? "LOADING"
                                : "NO ITEMS FOUND"}
                        </Typography>
                        {count !== itemsInStore && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth={true}
                                disableElevation
                                onClick={getMoreHardware}
                            >
                                {isMoreLoading ? (
                                    <CircularProgress
                                        size={25}
                                        data-testid="load-more-hardware-circular-progress"
                                    />
                                ) : (
                                    "Load more"
                                )}
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default Inventory;
