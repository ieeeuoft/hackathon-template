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
import { FileWatcherEventKind } from "typescript";

export const INCIDENT_ERROR_MSG = {
    state: "Please select an option",
    qty: "Please indicate the quantity",
    what: "Please indicate what happened to the hardware",
    when: "Please indicate when this occurred",
    where: "Please indicate where this occurred",
};

const radioOptions = ["broken", "lost", "other"];

const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const IncidentForm = () => {
    const dispatch = useDispatch();
    let history = useHistory();
    let location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const data = searchParams.get("data") ?? "0";

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

        // TODO: submit the form

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

                            {/* NEW FORMIK */}
                            {/* <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {(formikProps) => (
                                    <>
                                        {incidentFormComponents.map((field, index) => {
                                            if (field.description) {
                                                return (
                                                    <>
                                                        <Typography>
                                                            {" "}
                                                            {field.description}
                                                        </Typography>
                                                    </>
                                                );
                                            }

                                            if (field.type === "radio") {
                                                return <>Radio Group....</>;
                                            } else if (field.type === "select") {
                                                return (
                                                    <>
                                                        <FormControl
                                                            variant="outlined"
                                                            className={styles.dropdown}
                                                            error={
                                                                !!formikProps.errors
                                                                    ?.qty
                                                            }
                                                        >
                                                            <InputLabel id={field.id}>
                                                                {field.label}
                                                            </InputLabel>
                                                            <Select
                                                                name="qty"
                                                                value={
                                                                    formikProps.values
                                                                        .qty
                                                                }
                                                                label="Qty"
                                                                onChange={
                                                                    formikProps.handleChange
                                                                }
                                                                MenuProps={{
                                                                    anchorOrigin: {
                                                                        vertical:
                                                                            "bottom",
                                                                        horizontal:
                                                                            "left",
                                                                    },
                                                                    getContentAnchorEl:
                                                                        null,
                                                                }}
                                                                autoWidth
                                                            >
                                                                {createQuantityList(
                                                                    Number(data)
                                                                )}
                                                            </Select>
                                                            <FormHelperText>
                                                                {
                                                                    formikProps.errors
                                                                        ?.qty
                                                                }
                                                            </FormHelperText>
                                                        </FormControl>
                                                    </>
                                                );
                                            } else if (field.type === "text") {
                                                return (
                                                    <>
                                                        <TextField
                                                            id={field.id}
                                                            name={field.name}
                                                            placeholder={
                                                                field.placeholder
                                                            }
                                                            value={
                                                                formikProps.values.what
                                                            } // need to fix
                                                            error={
                                                                !!formikProps.errors
                                                                    ?.what
                                                            }
                                                            helperText={
                                                                formikProps.errors?.what
                                                            }
                                                            onChange={
                                                                formikProps.handleChange
                                                            }
                                                            variant="outlined"
                                                            type="text"
                                                            multiline
                                                        />
                                                    </>
                                                );
                                            }
                                            return <></>;
                                        })}
                                    </>
                                )}
                            </Formik> */}

                            {/* OLD FORMIK */}
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ errors, handleSubmit, handleChange, values }) => {
                                    const incidentFormComponents = [
                                        {
                                            type: "radio",
                                            id: "state",
                                            name: "state",
                                            options: ["broken", "lost", "other"],
                                            helperText: errors?.state,
                                            testId: "radio-state",
                                        },
                                        {
                                            type: "select",
                                            id: "qty",
                                            name: "qty",
                                            label: "Qty",
                                            description:
                                                "Number of Grove temperature and humidity sensor pro affected.",
                                            error: !!errors?.qty,
                                            helperText: errors?.qty,
                                        },
                                        {
                                            type: "text",
                                            id: "what",
                                            name: "what",
                                            label: "",
                                            description: "",
                                            placeholder:
                                                "What happened to the hardware?",
                                            value: values.what,
                                            error: !!errors?.what,
                                            helperText: errors?.what,
                                        },
                                        {
                                            type: "text",
                                            id: "when",
                                            name: "when",
                                            label: "",
                                            description: "",
                                            placeholder: "When did this occur?",
                                            value: values.when,
                                            error: !!errors?.when,
                                            helperText: errors?.when,
                                        },
                                        {
                                            type: "text",
                                            id: "where",
                                            name: "where",
                                            label: "",
                                            description: "",
                                            placeholder: "Where did this occur?",
                                            value: values.where,
                                            error: !!errors?.where,
                                            helperText: errors?.where,
                                        },
                                    ];

                                    return (
                                        <form
                                            onSubmit={handleSubmit}
                                            className={styles.form}
                                        >
                                            <div className={styles.formContainer}>
                                                {incidentFormComponents.map(
                                                    (item, index) => {
                                                        console.log(item);
                                                        return (
                                                            <div
                                                                key={`${item.type}-${item.name}`}
                                                                style={{
                                                                    paddingBottom:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {/* Used if the item has a description before the input form */}
                                                                {item?.description ? (
                                                                    <Typography>
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </Typography>
                                                                ) : (
                                                                    <></>
                                                                )}

                                                                {item.type ===
                                                                "radio" ? (
                                                                    <>
                                                                        <FormControl
                                                                            error={
                                                                                !!errors?.state
                                                                            }
                                                                        >
                                                                            <Field
                                                                                name={
                                                                                    item.name
                                                                                }
                                                                            >
                                                                                {({
                                                                                    field,
                                                                                }: {
                                                                                    field: any;
                                                                                }) => (
                                                                                    <>
                                                                                        <RadioGroup
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value
                                                                                            }
                                                                                            onChange={
                                                                                                field.onChange
                                                                                            }
                                                                                            data-testid={
                                                                                                item.testId
                                                                                            }
                                                                                            row
                                                                                        >
                                                                                            {item.options?.map(
                                                                                                (
                                                                                                    option: string,
                                                                                                    index
                                                                                                ) => {
                                                                                                    return (
                                                                                                        <React.Fragment
                                                                                                            key={`${option}-${index}`}
                                                                                                        >
                                                                                                            <FormControlLabel
                                                                                                                value={
                                                                                                                    option
                                                                                                                }
                                                                                                                control={
                                                                                                                    <Radio color="primary" />
                                                                                                                }
                                                                                                                label={capitalizeFirstLetter(
                                                                                                                    option
                                                                                                                )}
                                                                                                            />
                                                                                                        </React.Fragment>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                        </RadioGroup>
                                                                                    </>
                                                                                )}
                                                                            </Field>
                                                                            <FormHelperText>
                                                                                {
                                                                                    item.helperText
                                                                                }
                                                                                {/* {errors?.state} */}
                                                                            </FormHelperText>
                                                                        </FormControl>
                                                                    </>
                                                                ) : item.type ===
                                                                  "select" ? (
                                                                    <>
                                                                        <FormControl
                                                                            variant="outlined"
                                                                            className={
                                                                                styles.dropdown
                                                                            }
                                                                            error={
                                                                                item.error
                                                                            }
                                                                        >
                                                                            <InputLabel
                                                                                id={
                                                                                    item.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    item.label
                                                                                }
                                                                            </InputLabel>
                                                                            <Select
                                                                                name={
                                                                                    item.name
                                                                                }
                                                                                value={
                                                                                    item.value
                                                                                }
                                                                                label={
                                                                                    item.label
                                                                                }
                                                                                onChange={
                                                                                    handleChange
                                                                                }
                                                                                MenuProps={{
                                                                                    anchorOrigin:
                                                                                        {
                                                                                            vertical:
                                                                                                "bottom",
                                                                                            horizontal:
                                                                                                "left",
                                                                                        },
                                                                                    getContentAnchorEl:
                                                                                        null,
                                                                                }}
                                                                                autoWidth
                                                                            >
                                                                                {createQuantityList(
                                                                                    Number(
                                                                                        data
                                                                                    )
                                                                                )}
                                                                            </Select>
                                                                            <FormHelperText>
                                                                                {
                                                                                    item.helperText
                                                                                }
                                                                            </FormHelperText>
                                                                        </FormControl>
                                                                    </>
                                                                ) : item.type ===
                                                                  "text" ? (
                                                                    <div
                                                                        style={{
                                                                            width: "100%",
                                                                        }}
                                                                    >
                                                                        <TextField
                                                                            id={item.id}
                                                                            name={
                                                                                item.name
                                                                            }
                                                                            placeholder={
                                                                                item.placeholder
                                                                            }
                                                                            value={
                                                                                item.value
                                                                            }
                                                                            error={
                                                                                item.error
                                                                            }
                                                                            helperText={
                                                                                item.helperText
                                                                            }
                                                                            onChange={
                                                                                handleChange
                                                                            }
                                                                            variant="outlined"
                                                                            type="text"
                                                                            multiline
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}

                                                {/* <FormControl error={!!errors?.state}>
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
                                                                {radioOptions.map(
                                                                    (option) => {
                                                                        return (
                                                                            <FormControlLabel
                                                                                value={
                                                                                    option
                                                                                }
                                                                                control={
                                                                                    <Radio color="primary" />
                                                                                }
                                                                                label={capitalizeFirstLetter(
                                                                                    option
                                                                                )}
                                                                            />
                                                                        );
                                                                    }
                                                                )}
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
                                            <br></br> */}
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
                                    );
                                }}
                            </Formik>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default IncidentForm;
