import {
    Button,
    Checkbox,
    Grid,
    IconButton,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { mockHardware, mockCheckedOutOrdersInTable } from "testing/mockData";
import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import {
    GeneralOrderTableTitle,
    GeneralOrderTitle,
} from "components/general/OrderTables/OrderTables";
import { Formik } from "formik";
import Info from "@material-ui/icons/Info";

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

const setInitialValues = (
    request: { id: number; quantityRequested: number; quantityGranted: number }[]
) => {
    let orderInitialValues: Record<string, string | boolean> = {};
    request.forEach((orderItem) => {
        orderInitialValues[`${orderItem.id}-quantity`] =
            orderItem.quantityGranted.toString();
        orderInitialValues[`${orderItem.id}-checkbox`] = false;
        orderInitialValues[`${orderItem.id}-condtion`] = "Healthy";
    });
    return orderInitialValues;
};

export const TeamCheckedOutOrderTable = () => {
    const orders = mockCheckedOutOrdersInTable;
    const hardware = mockHardware;
    const [visibility, setVisibility] = useState(true);
    const toggleVisibility = () => {
        setVisibility(!visibility);
    };

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length > 0 && (
                <GeneralOrderTitle
                    title="Checked Out Items"
                    isVisible={visibility}
                    toggleVisibility={toggleVisibility}
                />
            )}
            {visibility &&
                orders.length &&
                orders.map((checkedOutOrder) => (
                    <Formik
                        initialValues={setInitialValues(
                            checkedOutOrder.hardwareInTableRow
                        )}
                        onSubmit={(values) =>
                            alert(JSON.stringify(values, undefined, 2))
                        }
                    >
                        {(props) => (
                            <form onSubmit={props.handleSubmit}>
                                <div key={checkedOutOrder.id}>
                                    <GeneralOrderTableTitle
                                        orderId={checkedOutOrder.id}
                                        orderStatus={checkedOutOrder.status}
                                    />
                                    <TableContainer
                                        component={Paper}
                                        elevation={2}
                                        square={true}
                                    >
                                        <Table className={styles.table} size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell
                                                        className={styles.widthFixed}
                                                    />
                                                    <TableCell
                                                        className={styles.width6}
                                                    >
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
                                                    <TableCell
                                                        className={`${styles.width1} ${styles.noWrap}`}
                                                    >
                                                        <Checkbox
                                                            color="primary"
                                                            data-testid={`checkall-${checkedOutOrder.id}`}
                                                            onChange={(e) => {
                                                                checkedOutOrder.hardwareInTableRow.forEach(
                                                                    (row) => {
                                                                        props.setFieldValue(
                                                                            `${row.id}-checkbox`,
                                                                            e.target
                                                                                .checked
                                                                        );
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {checkedOutOrder.hardwareInTableRow.map(
                                                    (row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            data-testid={`table-${checkedOutOrder.id}-${row.id}`}
                                                        >
                                                            <TableCell>
                                                                <img
                                                                    className={
                                                                        styles.itemImg
                                                                    }
                                                                    src={
                                                                        hardware[
                                                                            row.id - 1
                                                                        ]?.picture ??
                                                                        hardwareImagePlaceholder
                                                                    }
                                                                    alt={
                                                                        hardware[
                                                                            row.id - 1
                                                                        ]?.name
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id - 1]
                                                                        ?.name
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    size={"small"}
                                                                >
                                                                    <Info />
                                                                </IconButton>
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id - 1]
                                                                        ?.quantity_available
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems:
                                                                            "end",
                                                                    }}
                                                                >
                                                                    <Link
                                                                        underline="always"
                                                                        color="textPrimary"
                                                                        style={{
                                                                            marginRight:
                                                                                "15px",
                                                                        }}
                                                                        data-testid={`all-button`}
                                                                        onClick={() => {
                                                                            props.setFieldValue(
                                                                                `${row.id}-quantity`,
                                                                                row.quantityGranted
                                                                            );
                                                                        }}
                                                                    >
                                                                        All
                                                                    </Link>
                                                                    <Select
                                                                        value={
                                                                            props
                                                                                .values[
                                                                                `${row.id}-quantity`
                                                                            ]
                                                                        }
                                                                        onChange={
                                                                            props.handleChange
                                                                        }
                                                                        label="Qty"
                                                                        labelId="qtyLabel"
                                                                        name={`${row.id}-quantity`}
                                                                        id={`${row.id}-quantity`}
                                                                        data-testid={`select`}
                                                                    >
                                                                        {createDropdownList(
                                                                            row.quantityGranted
                                                                        )}
                                                                    </Select>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell align={"right"}>
                                                                {
                                                                    hardware[row.id - 1]
                                                                        ?.quantity_remaining
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={
                                                                        props.values[
                                                                            `${row.id}-condition`
                                                                        ]
                                                                    }
                                                                    onChange={
                                                                        props.handleChange
                                                                    }
                                                                    label="Condition"
                                                                    labelId="conditionLabel"
                                                                    name={`${row.id}-condition`}
                                                                    id={`${row.id}-condition`}
                                                                    defaultValue={
                                                                        "Healthy"
                                                                    }
                                                                >
                                                                    <MenuItem value="Healthy">
                                                                        Healthy
                                                                    </MenuItem>
                                                                    <MenuItem value="Heavily Used">
                                                                        Heavily Used
                                                                    </MenuItem>
                                                                    <MenuItem value="Broken">
                                                                        Broken
                                                                    </MenuItem>
                                                                    <MenuItem value="Lost">
                                                                        Lost
                                                                    </MenuItem>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Checkbox
                                                                    color="primary"
                                                                    checked={
                                                                        props.values[
                                                                            `${row.id}-checkbox`
                                                                        ] === true
                                                                    }
                                                                    name={`${row.id}-checkbox`}
                                                                    onChange={
                                                                        props.handleChange
                                                                    }
                                                                    data-testid={`${row.id}-checkbox`}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
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
                                                type="submit"
                                                disableElevation
                                                data-testid={`return-button-${checkedOutOrder.id}`}
                                            >
                                                Return Items
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </div>
                            </form>
                        )}
                    </Formik>
                ))}
        </Container>
    );
};

export default TeamCheckedOutOrderTable;
