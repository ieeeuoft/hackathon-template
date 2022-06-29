import React, { ChangeEvent, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import { Formik, Form, Field, FormikValues } from "formik";
import * as Yup from "yup";
import {
    MenuItem,
    Select,
    Table,
    TableContainer,
    TextField,
    TableHead,
    TableCell,
    TableRow,
    TableBody,
    Grid,
    Button,
    Checkbox,
    Link,
    FormControl,
    Paper,
} from "@material-ui/core";
import styles from "components/dashboard/ItemTable/ItemTable.module.scss";
import { mockPendingOrders, mockHardware } from "../../testing/mockData";

const formSchema = Yup.object().shape({
    firstName: Yup.string()
        .equals(["bob", "jane"], "Not bob or jane!! Baddd")
        .required("Please fill out this field! :)))"),
    email: Yup.string().email("this is not an email!"),
});

const createDropdownList = (number: number) => {
    let entry = [];

    for (let i = 1; i <= number; i++) {
        entry.push(
            <MenuItem key={i} role="quantity" value={i.toString()}>
                {i}
            </MenuItem>
        );
    }

    return entry;
};

const AdminDashboard = () => {
    // const [formData, setFormData] = useState({})
    // const handleChange = (e) => {
    //     if (e)
    //         setFormData((prevFormData) => ({
    //             ...prevFormData,
    //             [e.target.name]: e.target.value
    //         }))
    // }

    const hardware = [...mockHardware];
    const handleSubmitExternal = async (values: FormikValues) => {
        console.log(values);
    };

    let orderInitalValues: Record<string, Record<string, string | boolean>> = {};
    mockPendingOrders[0].request.forEach((orderItem) => {
        orderInitalValues[`mui-component-select-${orderItem.id}`] = {
            "quantity-granted": orderItem.requested_quantity.toString(),
            checkbox: false,
        };
    });

    console.log(orderInitalValues);
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>

            {/* Normal Form */}
            {/*<form onSubmit={() => console.log(formData)}>*/}
            {/*    <input type="email" name="email" onChange={handleChange}/>*/}
            {/*    <select name="fruit" onChange={handleChange}>*/}
            {/*        <option value="apple">Apple</option>*/}
            {/*        <option value="orange">Orange</option>*/}
            {/*        <option value="lemon">Lemon</option>*/}
            {/*        <option value="strawberry">Strawberry</option>*/}
            {/*    </select>*/}
            {/*    <button type="submit">Submit</button>*/}
            {/*</form>*/}

            {/* Formik Yayy */}
            <Formik
                initialValues={{
                    firstName: "",
                    lastName: "",
                    email: "",
                    fruit: "",
                    age: 10,
                }}
                onSubmit={handleSubmitExternal}
                validationSchema={formSchema}
            >
                {({ errors, handleSubmit, handleChange, values }) => (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={values.firstName}
                            error={!!errors?.firstName}
                            helperText={errors?.firstName}
                            onChange={handleChange}
                        />
                        <br />
                        <label htmlFor="lastName">Last Name</label>
                        <Field id="lastName" name="lastName" placeholder="Doe" />
                        <br />
                        <label htmlFor="email">Email</label>
                        <Field
                            id="email"
                            name="email"
                            placeholder="jane@acme.com"
                            type="email"
                        />
                        <br />
                        <Select
                            name="age"
                            value={values.age}
                            label="Age"
                            onChange={handleChange}
                        >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>

                        <br />
                        <button type="submit">Submit</button>
                    </form>
                )}
            </Formik>

            <Formik
                initialValues={orderInitalValues}
                onSubmit={(values) => console.log(values)}
            >
                {({ errors, handleSubmit, handleChange, values }) => (
                    <>
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
                                            Model
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                        >
                                            Manufacturer
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                        >
                                            Qty requested
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width6} ${styles.noWrap}`}
                                        >
                                            Qty granted
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
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
                                    {mockPendingOrders[0].request.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <img
                                                    className={styles.itemImg}
                                                    src={hardware[row.id]?.picture}
                                                    alt={hardware[row.id]?.name}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {hardware[row.id]?.name}
                                            </TableCell>
                                            <TableCell>
                                                {hardware[row.id]?.model_number}
                                            </TableCell>
                                            <TableCell>
                                                {hardware[row.id]?.manufacturer}
                                            </TableCell>
                                            <TableCell>
                                                {row.requested_quantity}
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
                                                            value={
                                                                values[
                                                                    `mui-component-select-${row.id}`
                                                                ]["quantity-granted"]
                                                            }
                                                            label="Qty"
                                                            labelId="qtyLabel"
                                                            name={`${row.id}.quantity-granted`}
                                                            onChange={handleChange}
                                                        >
                                                            {createDropdownList(
                                                                row.requested_quantity +
                                                                    5
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                            </TableCell>
                                            <TableCell>00:00:00 - 00/00/00</TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    name={`order-item-${row.id}.checkbox`}
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
                                    color="secondary"
                                    variant="text"
                                    disableElevation
                                >
                                    Reject Order
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    disableElevation
                                >
                                    Complete Order
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Formik>
        </>
    );
};

export default AdminDashboard;
