import React from "react";
// import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import { inventoryCategories } from "testing/mockData";

const applyFilter = () => alert("Applies the filter");

const removeFilter = () => alert("Removes all filters and resets form");

const Inventory = () => {
    return (
        <div>
            <Header />
            <Typography variant="h1">Hardware Inventory</Typography>
            <p>IEEEEEE</p>
            <InventoryFilter
                categories={inventoryCategories}
                applyFilter={applyFilter}
                removeFilter={removeFilter}
            />
        </div>
    );
};

export default Inventory;
