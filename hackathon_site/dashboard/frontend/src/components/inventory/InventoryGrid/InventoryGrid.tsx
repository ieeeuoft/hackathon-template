import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Inventory/Inventory.module.scss";
import Item from "components/inventory/Item/Item";

import { Hardware } from "api/types";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "slices/store";
import { hardwareSelectors } from "slices/hardware/hardwareSlice";

interface InventoryGridProps {
    items: Hardware[];
}

export const UnconnectedInventoryGrid = ({ items }: InventoryGridProps) => (
    <Grid direction="row" spacing={2} container>
        {items.map((item) => (
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
        ))}
    </Grid>
);

const mapStateToProps = (state: RootState) => ({
    items: hardwareSelectors.selectAll(state),
});

const connector = connect(mapStateToProps, {});

type ConnectedInventoryGridProps = ConnectedProps<typeof connector>;

export const ConnectedInventoryGrid = connector(UnconnectedInventoryGrid);

export default ConnectedInventoryGrid;
