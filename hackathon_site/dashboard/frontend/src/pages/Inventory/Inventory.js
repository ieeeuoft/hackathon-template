import React from "react";
// import styles from "./Inventory.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import EnhancedInventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";

const Inventory = () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const onSubmitTemp = async (formikValues) => {
        await sleep(300);
        alert(JSON.stringify(formikValues, null, 2));
    };

    return (
        <div>
            <Header />
            <Typography variant="h1">Hardware Inventory</Typography>
            <p>IEEEEEE</p>
            <EnhancedInventoryFilter
                handleSubmit={onSubmitTemp}
                handleReset={onSubmitTemp}
            />
        </div>
    );
};

export default Inventory;
