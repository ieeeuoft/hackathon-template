import React from "react";
import styles from "./Inventory.module.scss";
import { useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import RefreshIcon from "@material-ui/icons/Refresh";
import SearchIcon from "@material-ui/icons/Search";
import FilterListIcon from "@material-ui/icons/FilterList";
import Grid from "@material-ui/core/Grid";
import EnhancedInventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import Item from "components/inventory/Item/Item";
import ProductOverview from "components/inventory/ProductOverview/ProductOverview";
import { productInformation, inventoryItems } from "testing/mockData";

const Inventory = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const toggleFilter = () => {
        setMobileOpen(!mobileOpen);
    };

    // Remove this later once filter data is able to be submitted
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const onSubmitTemp = async ({ orderBy, inStock, inventoryCategories }) => {
        await sleep(300);
        alert(JSON.stringify({ orderBy, inStock, inventoryCategories }, null, 2));
        setMobileOpen(false);
    };

    // Remove this later once items can be added to cart
    const addToCart = () => {
        alert("Add to cart");
        setItemOverview(null);
    };

    const [itemOverview, setItemOverview] = React.useState(null);
    const toggleMenu = () => {
        setItemOverview(null);
    };

    // itemOverview will be sent to api
    React.useEffect(() => console.log("itemOverview", itemOverview), [itemOverview]);

    return (
        <>
            <Header />
            <ProductOverview
                detail={productInformation}
                addToCart={addToCart}
                isVisible={typeof itemOverview == "number"}
                handleClose={toggleMenu}
            />
            <div className={styles.inventory}>
                <Drawer
                    className={styles.inventoryFilterDrawer}
                    open={mobileOpen}
                    onClose={toggleFilter}
                >
                    <EnhancedInventoryFilter
                        handleSubmit={onSubmitTemp}
                        handleReset={onSubmitTemp}
                        isApplyLoading={false}
                        isClearLoading={false}
                    />
                </Drawer>

                <Typography variant="h1">Hardware Inventory</Typography>

                <div className={styles.inventoryBody}>
                    <Hidden implementation="css" smDown>
                        <EnhancedInventoryFilter
                            handleSubmit={onSubmitTemp}
                            handleReset={onSubmitTemp}
                            isApplyLoading={false}
                            isClearLoading={false}
                        />
                    </Hidden>

                    <div className={styles.inventoryBodyRight}>
                        <div className={styles.inventoryBodyToolbar}>
                            <div className={styles.inventoryBodyToolbarDiv}>
                                <TextField
                                    className={styles.inventoryBodyToolbarSearch}
                                    id="search-input"
                                    label="Search items"
                                    variant="outlined"
                                    size="small"
                                />
                                <IconButton
                                    color="primary"
                                    aria-label="Search"
                                    variant="contained"
                                >
                                    <SearchIcon />
                                </IconButton>
                            </div>

                            <Divider
                                orientation="vertical"
                                className={styles.inventoryBodyToolbarDivider}
                                flexItem
                            />

                            <div className={styles.inventoryBodyToolbarDiv}>
                                <Hidden implementation="css" mdUp>
                                    <Button
                                        aria-label="Orders"
                                        startIcon={<FilterListIcon />}
                                        onClick={toggleFilter}
                                    >
                                        Filter
                                    </Button>
                                </Hidden>

                                <div className={styles.inventoryBodyToolbarRefresh}>
                                    <Typography variant="body2">123 items</Typography>
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
                        <Grid direction="row" spacing={2} container>
                            {inventoryItems.map((item) => (
                                <Grid
                                    xs={6}
                                    sm={4}
                                    md={3}
                                    lg={2}
                                    xl={1}
                                    className={styles.Item}
                                    key={item.id}
                                    item
                                    onClick={() => setItemOverview(item.id)}
                                >
                                    <Item
                                        image={item.image}
                                        title={item.title}
                                        total={item.total}
                                        currentStock={item.currentStock}
                                    />
                                </Grid>
                            ))}
                        </Grid>
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

export default Inventory;
