import React from "react";
import styles from "./IncidentForm.module.scss";
import {
    Typography,
    Card,
    CardContent,
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
import { useHistory, useLocation } from "react-router-dom";
import { Formik, Field, FormikValues } from "formik";
import * as Yup from "yup";
import Header from "components/general/Header/Header";
import ArrowLeft from "../../assets/images/icons/arrow-left-solid.svg";
import { displaySnackbar } from "slices/ui/uiSlice";
import { useDispatch } from "react-redux";

export const INCIDENT_ERROR_MSG = {
    state: "Please select an option",
    qty: "Please indicate the quantity",
    what: "Please indicate what happened to the hardware",
    when: "Please indicate when this occurred",
    where: "Please indicate where this occurred",
};

const IncidentForm = () => {
    const dispatch = useDispatch();
    let history = useHistory();
    let location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const data = searchParams.get("data");

    const validationSchema = Yup.object({
        state: Yup.string().required(INCIDENT_ERROR_MSG.state),
        qty: Yup.string().required(INCIDENT_ERROR_MSG.qty),
        what: Yup.string().required(INCIDENT_ERROR_MSG.what),
        when: Yup.string().required(INCIDENT_ERROR_MSG.when),
        where: Yup.string().required(INCIDENT_ERROR_MSG.where),
    });

    const initialValues = {
        state: "",
        qty: "",
        what: "",
        when: "",
        where: "",
    };

    const handleSubmit = async (values: FormikValues, { resetForm }: any) => {
        console.log("submit");
        console.log(values);
        // await submit function
        resetForm();

        // display success snackbar
        dispatch(
            displaySnackbar({
                message: `Successfully submitted incident form!`,
                options: {
                    variant: "success",
                },
            })
        );
        // navigate back to previous page
        history.goBack();
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
                            <div style={{ marginBottom: "20px" }}>
                                <Typography variant="h1">Item Incident Form</Typography>
                            </div>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ errors, handleSubmit, handleChange, values }) => (
                                    <form
                                        onSubmit={handleSubmit}
                                        className={styles.form}
                                    >
                                        <div className={styles.formContainer}>
                                            <FormControl error={!!errors?.state}>
                                                <Field name="state">
                                                    {({ field }: { field: any }) => (
                                                        <>
                                                            <RadioGroup
                                                                {...field}
                                                                value={field.value}
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                data-testid="radio-state"
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
                                                    {errors?.state}
                                                </FormHelperText>
                                            </FormControl>
                                            <br></br>
                                            <Typography>
                                                Number of Grove temperature and humidity
                                                sensor pro affected.
                                            </Typography>
                                            <br></br>
                                            <FormControl
                                                variant="outlined"
                                                className={styles.dropdown}
                                                error={!!errors?.qty}
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
                                                    {createQuantityList(Number(data))}
                                                </Select>
                                                <FormHelperText>
                                                    {errors?.qty}
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
                                            <div
                                                style={{
                                                    alignSelf: "center",
                                                    width: "fit-contents",
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Submit
                                                </Button>
                                            </div>
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
