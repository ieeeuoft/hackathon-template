import {
    Checkbox,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { mockPendingOrders, mockHardware } from "testing/mockData";
import React from "react";
import Container from "@material-ui/core/Container";
import styles from "components/dashboard/ItemTable/ItemTable.module.scss";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";

const createDropdownList = (number: number) => {
    let entry = [];

    for (let i = 0; i <= number; i++) {
        entry.push(
            <MenuItem key={i} role="quantity" value={i.toString()}>
                {i}
            </MenuItem>
        );
    }

    return entry;
};

export const TeamPendingOrderTable = () => {
    const orders = mockPendingOrders;
    const hardware = mockHardware;

    return (
        <Container maxWidth={false} disableGutters={true}>
            {orders.map((pendingOrder) => (
                <Grid container direction="column" spacing={1} item md={6} xs={12}>
                    <Grid item>
                        <Typography variant="h2">{`Order #${pendingOrder.id}`}</Typography>
                    </Grid>
                    <Grid item>
                        <Table
                            className={styles.table}
                            size="small"
                            aria-label="pending table"
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell className={styles.widthFixed} />
                                    <TableCell className={styles.width6} align="left">
                                        Name
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                        align="left"
                                    >
                                        Model
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                        align="left"
                                    >
                                        Manufacturer
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                        align="left"
                                    >
                                        Qty requested
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                        align="left"
                                    >
                                        Qty granted
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                        align="right"
                                    >
                                        Time
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
                                {pendingOrder.request.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell align="left">
                                            <img
                                                className={styles.itemImg}
                                                src={
                                                    hardware[row.id]?.picture ??
                                                    hardwareImagePlaceholder
                                                }
                                                alt={hardware[row.id]?.name}
                                            />
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.noWrap}`}
                                            align="left"
                                        >
                                            {`${hardware[row.id]?.name}`}
                                        </TableCell>
                                        <TableCell align="right">
                                            {`${hardware[row.id]?.model_number}`}
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.noWrap}`}
                                            align="right"
                                        >
                                            {`${hardware[row.id]?.manufacturer}`}
                                        </TableCell>
                                        <TableCell align="right">
                                            {`${row.requested_quantity}`}
                                        </TableCell>
                                        <TableCell align="right">
                                            <FormControl
                                                variant="standard"
                                                hiddenLabel={true}
                                            >
                                                <Select
                                                    value={0}
                                                    // onChange={handleChange}
                                                    label="Qty"
                                                    labelId="qtyLabel"
                                                    name="quantity"
                                                >
                                                    {createDropdownList(
                                                        row.requested_quantity
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.noWrap}`}
                                            align="right"
                                        >
                                            {`${pendingOrder.created_at}`}
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
                    </Grid>
                </Grid>
            ))}
        </Container>
    );
};

export default TeamPendingOrderTable;
