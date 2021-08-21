import React, { useEffect } from "react";
import styles from "./Inventory.module.scss";
import Drawer from "@material-ui/core/Drawer";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import RefreshIcon from "@material-ui/icons/Refresh";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from "@material-ui/icons/FilterList";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import InventoryGrid from "components/inventory/InventoryGrid/InventoryGrid";
import ProductOverview from "components/inventory/ProductOverview/ProductOverview";
import { productInformation } from "testing/mockData";
import InventorySearch from "components/inventory/InventorySearch/InventorySearch";
import { RootState } from "slices/store";
import { connect, ConnectedProps } from "react-redux";
import { clearFilters, getHardwareWithFilters } from "slices/hardware/hardwareSlice";

const UnconnectedInventory = ({
    clearFilters,
    getHardwareWithFilters,
}: ConnectedInventoryProps) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const toggleFilter = () => {
        setMobileOpen(!mobileOpen);
    };

    // Remove this later once filter data is able to be submitted
    // const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // const onSubmitTemp = async ({ orderBy, inStock, inventoryCategories }) => {
    //     await sleep(300);
    //     alert(JSON.stringify({ orderBy, inStock, inventoryCategories }, null, 2));
    //     setMobileOpen(false);
    // };

    // Remove this later once items can be added to cart
    const addToCart = () => {
        alert("Add to cart");
        setItemOverviewId(null);
    };

    const [itemOverviewId, setItemOverviewId] = React.useState<number | null>(null);
    const toggleMenu = () => {
        setItemOverviewId(null);
    };

    // use itemOverviewId to fetch the info from the store
    // React.useEffect(() => console.log("itemOverviewId", itemOverviewId), [
    //     itemOverviewId,
    // ]);

    // When the page is loaded, clear filters and fetch fresh inventory data
    useEffect(() => {
        clearFilters();
        getHardwareWithFilters();
    }, [clearFilters, getHardwareWithFilters]);

    return (
        <>
            <Header />
            <ProductOverview
                detail={productInformation}
                addToCart={addToCart}
                isVisible={typeof itemOverviewId == "number"}
                handleClose={toggleMenu}
            />
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

                <div className={styles.inventoryBody}>
                    <Hidden implementation="css" smDown>
                        <InventoryFilter />
                    </Hidden>

                    <div className={styles.inventoryBodyRight}>
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
                                    <Typography variant="body2">123 items</Typography>
                                    <IconButton color="primary" aria-label="Refresh">
                                        <RefreshIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        <InventoryGrid />
                        <Divider className={styles.inventoryLoadDivider} />
                        <Typography variant="subtitle2" align="center" paragraph>
                            SHOWING 100 OF 123 ITEMS
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth={true}
                            disableElevation
                        >
                            Load more
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state: RootState) => ({});

const connector = connect(mapStateToProps, { clearFilters, getHardwareWithFilters });

type ConnectedInventoryProps = ConnectedProps<typeof connector>;

export const ConnectedInventory = connector(UnconnectedInventory);

export default ConnectedInventory;
