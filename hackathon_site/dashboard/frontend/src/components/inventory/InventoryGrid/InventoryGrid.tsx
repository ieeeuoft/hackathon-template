import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Inventory/Inventory.module.scss";
import Item from "components/inventory/Item/Item";

import { useSelector } from "react-redux";
import { hardwareSelectors } from "slices/hardware/hardwareSlice";
import { Typography } from "@material-ui/core";

export const InventoryGrid = () => {
    const items = useSelector(hardwareSelectors.selectAll);

    return (
        <Grid direction="row" spacing={2} container>
            {items.length > 0 ? (
                items.map((item) => (
                    <Grid
                        xs={6}
                        sm={4}
                        md={3}
                        lg={2}
                        xl={1}
                        className={styles.Item}
                        key={item.id}
                        item
                        // onClick={() => setItemOverviewId(item.id)}
                        onClick={() => alert(`Clicked ${item.name}`)}
                    >
                        <Item
                            image={item.picture}
                            title={item.name}
                            total={item.quantity_available}
                            currentStock={item.quantity_remaining}
                        />
                    </Grid>
                ))
            ) : (
                <Grid xs={12} item className={styles.Item}>
                    <Typography>No items found</Typography>
                </Grid>
            )}
        </Grid>
    );
};

export default InventoryGrid;
