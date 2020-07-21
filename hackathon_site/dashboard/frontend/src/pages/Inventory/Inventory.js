import React from "react";
// import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import EnhancedInventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import { inventoryCategories } from "testing/mockData";

const Inventory = () => {
    return (
        <div>
            <Header />
            <Typography variant="h1">Hardware Inventory</Typography>
            <p>IEEEEEE</p>
            <EnhancedInventoryFilter />
        </div>
    );
};

export default Inventory;
