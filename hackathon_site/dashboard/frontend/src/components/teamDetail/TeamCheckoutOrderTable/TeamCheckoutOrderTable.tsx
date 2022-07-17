import {
    Button,
    Checkbox,
    Container,
    Grid,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    Select,
    Typography,
} from "@material-ui/core";
import { mockHardware, mockCheckedOutOrders } from "testing/mockData";
import React from "react";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import Info from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import { inspect } from "util";

export const TeamCheckoutOrderTable = () => {
    const orders = mockCheckedOutOrders;
    const hardware = mockHardware;

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length &&
                orders.map((checkoutOrder) => (
                    <div key={checkoutOrder.id}>
                        <Grid item>
                            <Typography variant="h2">{`Order #${checkoutOrder.id}`}</Typography>
                        </Grid>
                        <br />
                        <TableContainer component={Paper} elevation={2} square={true}>
                            <Table className={styles.table} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={styles.widthFixed} />
                                        <TableCell className={styles.width6}>
                                            Name
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                        >
                                            Info
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                        >
                                            Qty
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                        >
                                            Qty to return
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width6} ${styles.noWrap}`}
                                            align={"right"}
                                        >
                                            Qty remaining
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                        >
                                            Condition
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                color="primary"
                                                style={{
                                                    marginLeft: "-15px",
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {checkoutOrder.request.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <img
                                                    className={styles.itemImg}
                                                    src={
                                                        hardware[row.id]?.picture ??
                                                        hardwareImagePlaceholder
                                                    }
                                                    alt={hardware[row.id]?.name}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {hardware[row.id]?.name}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                <IconButton size={"small"}>
                                                    <Info
                                                        style={{
                                                            marginLeft: "-30px",
                                                        }}
                                                    />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                {`${
                                                    hardware[row.id]?.quantity_available
                                                }`}
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "end",
                                                    }}
                                                >
                                                    <Link
                                                        underline="always"
                                                        color="textPrimary"
                                                        style={{ marginRight: "15px" }}
                                                    >
                                                        All
                                                    </Link>
                                                    <FormControl
                                                        variant="standard"
                                                        hiddenLabel={true}
                                                    >
                                                        <Select
                                                            label="Qty"
                                                            labelId="qtyLabel"
                                                            name="quantity"
                                                        >
                                                            <option value="1">1</option>
                                                            <option value="2">2</option>
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                            </TableCell>
                                            <TableCell align={"right"}>
                                                {`${
                                                    hardware[row.id]?.quantity_remaining
                                                }`}
                                            </TableCell>
                                            <TableCell>
                                                <Select>
                                                    <option value="Healthy">
                                                        Healthy
                                                    </option>
                                                    <option value="Heavily Used">
                                                        Heavily Used
                                                    </option>
                                                    <option value="Broken">
                                                        Broken
                                                    </option>
                                                    <option value="Lost">Lost</option>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    color="primary"
                                                    style={{
                                                        marginLeft: "-15px",
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid
                            container
                            justifyContent="flex-end"
                            spacing={1}
                            style={{ marginTop: "10px" }}
                        >
                            <Grid item>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    disableElevation
                                >
                                    Return Items
                                </Button>
                            </Grid>
                        </Grid>
                        <br />
                    </div>
                ))}
        </Container>
    );
};

export default TeamCheckoutOrderTable;
