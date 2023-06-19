import React, { useEffect, useState } from "react";
import styles from "./IncidentForm.module.scss";
import {
    Typography,
    Container,
    Card,
    CardContent,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
    Button,
    TextField,
    FormControl,
    InputLabel,
    FormHelperText,
} from "@material-ui/core";
import { Route, Link, useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";

import Header from "components/general/Header/Header";

import ArrowLeft from "../../assets/images/icons/arrow-left-solid.svg";

const IncidentForm = (url: string) => {
    const [goBack, setGoBack] = useState(false);
    let history = useHistory();

    // form schema stuff
    const validationSchema = Yup.object({
        state: Yup.string().required("Please select an option"),
        qty: Yup.string().required("Please indicate the quantity"),
        what: Yup.string().required("Please indicate what happened to the hardware"),
        when: Yup.string().required("Please indicate when this occurred"),
        where: Yup.string().required("Please indicate where this occurred"),
    });

    const initialValues = {
        state: "",
        qty: "",
        what: "",
        when: "",
        where: "",
    };

    const handleSubmit = async (values: FormikValues) => {
        console.log("submit");
        console.log(values);
    };

    const createQuantityList = (number: number) => {
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

    return (
        <>
            <Header />
            <div className={styles.pageContent}>
                <img
                    src={ArrowLeft}
                    onClick={() => history.goBack()}
                    alt="back arrow"
                    className={styles.arrowIcon}
                />
                <Card className={styles.card}>
                    <CardContent>
                        <div className={styles.cardContent}>
                            <div className={styles.header}>
                                <Typography variant="h1">Item Incident Form</Typography>
                            </div>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ errors, handleSubmit, handleChange, values }) => (
                                    <form onSubmit={handleSubmit}>
                                        <div className={styles.formContainer}>
                                            <FormControl error={!!errors?.qty}>
                                                <Field name="state">
                                                    {({ field }: { field: any }) => (
                                                        <>
                                                            <RadioGroup
                                                                {...field}
                                                                value={field.value}
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                row
                                                            >
                                                                <FormControlLabel
                                                                    value="broken"
                                                                    control={
                                                                        <Radio color="primary" />
                                                                    }
                                                                    label="Broken"
                                                                />
                                                                <FormControlLabel
                                                                    value="lost"
                                                                    control={
                                                                        <Radio color="primary" />
                                                                    }
                                                                    label="Lost"
                                                                />
                                                                <FormControlLabel
                                                                    value="other"
                                                                    control={
                                                                        <Radio color="primary" />
                                                                    }
                                                                    label="Other"
                                                                />
                                                            </RadioGroup>
                                                        </>
                                                    )}
                                                </Field>
                                                <FormHelperText>
                                                    {errors?.qty}
                                                </FormHelperText>
                                            </FormControl>
                                            {/* {errors.qty && <p>{errors.qty}</p>} */}
                                            <br></br>
                                            <Typography>
                                                Number of Grove temperature and humidity
                                                sensor pro affected
                                            </Typography>
                                            <br></br>
                                            <FormControl
                                                variant="outlined"
                                                className={styles.formControl}
                                            >
                                                <InputLabel id="qty">Qty</InputLabel>
                                                <Select
                                                    name="qty"
                                                    value={values.qty}
                                                    label="Qty"
                                                    onChange={handleChange}
                                                    MenuProps={{
                                                        anchorOrigin: {
                                                            vertical: "bottom",
                                                            horizontal: "left",
                                                        },
                                                        getContentAnchorEl: null,
                                                    }}
                                                    autoWidth
                                                >
                                                    {createQuantityList(8)}
                                                </Select>
                                                <FormHelperText>
                                                    {!!errors?.qty}
                                                </FormHelperText>
                                            </FormControl>

                                            <br></br>
                                            <TextField
                                                id="what"
                                                name="what"
                                                placeholder="What happened to the hardware?"
                                                value={values.what}
                                                error={!!errors?.what}
                                                helperText={errors?.what}
                                                onChange={handleChange}
                                                variant="outlined"
                                                type="text"
                                                multiline
                                            />
                                            <br></br>
                                            <TextField
                                                id="when"
                                                name="when"
                                                placeholder="When did this occur?"
                                                value={values.when}
                                                error={!!errors?.when}
                                                helperText={errors?.when}
                                                onChange={handleChange}
                                                variant="outlined"
                                                type="text"
                                                multiline
                                            />
                                            <br></br>
                                            <TextField
                                                id="where"
                                                name="where"
                                                placeholder="Where did this occur?"
                                                value={values.where}
                                                error={!!errors?.where}
                                                helperText={errors?.where}
                                                onChange={handleChange}
                                                variant="outlined"
                                                type="text"
                                                multiline
                                            />
                                            <br></br>
                                            <Button type="submit">Submit</Button>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default IncidentForm;
