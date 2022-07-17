import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";

import Typography from "@material-ui/core/Typography";
import React from "react";
import Info from "@material-ui/icons/Info";
import styles from "../../dashboard/ItemTable/ItemTable.module.scss";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import IconButton from "@material-ui/core/IconButton";
import { mockCheckedOutOrders, mockHardware } from "testing/mockData";
import { Add } from "@material-ui/icons";

export const TeamCheckoutOrderTable = () => {
    const hardware = mockHardware;
    const orders = mockCheckedOutOrders;
    return (
        <Container maxWidth={false} disableGutters={true}>
            {orders.map((checkoutOrder) => (
                <Grid container direction="column" spacing={1} item md={6} xs={12}>
                    <Grid item>
                        <Typography variant="h2">{`Order #${checkoutOrder.id}`}</Typography>
                    </Grid>
                    <Grid item>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Info</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Qty to return</TableCell>
                                        <TableCell>Qty remaining</TableCell>
                                        <TableCell>Condition</TableCell>
                                        <TableCell>Box</TableCell>
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
                                            <TableCell>{`${
                                                hardware[row.id]?.name
                                            }`}</TableCell>
                                            <TableCell>
                                                <TableCell>
                                                    <IconButton size={"small"}>
                                                        <Info
                                                            style={{
                                                                marginLeft: "-20px",
                                                            }}
                                                        />
                                                    </IconButton>
                                                </TableCell>
                                            </TableCell>
                                            <TableCell>
                                                {`${
                                                    hardware[row.id]?.quantity_available
                                                }`}
                                            </TableCell>
                                            <TableCell>
                                                All
                                                <FormControl
                                                    variant="standard"
                                                    hiddenLabel={true}
                                                >
                                                    <Select
                                                        value={0}
                                                        label="Qty"
                                                        labelId="qtyLabel"
                                                        name="quantity"
                                                    ></Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell align="center">{`${
                                                hardware[row.id]?.quantity_remaining
                                            }`}</TableCell>
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
                                                        marginLeft: "-10px",
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Box pr={0.5} pt={1}>
                        <Grid container justifyContent="flex-end">
                            <Button
                                color="primary"
                                variant="contained"
                                disableElevation
                            >
                                Return Items
                            </Button>
                        </Grid>
                    </Box>
                </Grid>
            ))}
        </Container>
    );
};

export default TeamCheckoutOrderTable;
