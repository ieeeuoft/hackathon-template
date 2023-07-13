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
    makeStyles,
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

const useStyles = makeStyles({
    typographyLabel: {
        paddingBottom: "10px", // Adjust the value as per your requirement
    },
});

const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const IncidentForm = () => {
    const muiClasses = useStyles();

    const dispatch = useDispatch();
    let history = useHistory();
    let location = useLocation();

    // get info from url
    const searchParams = new URLSearchParams(location.search);
    let hardwareQuantity: number; // quantity used for dropdown
    try {
        const data = searchParams.get("data") ?? "";
        const checkedOutOrder = JSON.parse(data); // parse string from url into an object
        hardwareQuantity = checkedOutOrder?.quantityGranted; // set the hardware qty for dropdown
    } catch {
        hardwareQuantity = 0; // set the qty to 0 if there is no url
    }

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
        if (number === 0) {
            entry.push(
                <MenuItem key={"0"} role="quantity" value={"0"}>
                    {0}
                </MenuItem>
            );
        } else {
            for (let i = 1; i <= number; i++) {
                entry.push(
                    <MenuItem key={i} role="quantity" value={i.toString()}>
                        {i}
                    </MenuItem>
                );
            }
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
                            <div className={styles.titleMargin}>
                                <Typography variant="h1">Item Incident Form</Typography>
                            </div>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                validateOnChange={false}
                                validateOnBlur={false}
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
                                            value: values.qty,
                                            error: !!errors?.qty,
                                            helperText: errors?.qty,
                                            testId: "qty-dropdown",
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
                                                        return (
                                                            <div
                                                                key={`${item.type}-${item.name}`}
                                                                className={
                                                                    styles.formComponentContainer
                                                                }
                                                            >
                                                                {/* Used if the item has a description before the input form */}
                                                                {item?.description ? (
                                                                    <Typography
                                                                        className={
                                                                            muiClasses.typographyLabel
                                                                        }
                                                                    >
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
                                                                                data-testid={
                                                                                    item.testId
                                                                                }
                                                                            >
                                                                                {createQuantityList(
                                                                                    Number(
                                                                                        hardwareQuantity
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
                                                                        className={
                                                                            styles.textboxFill
                                                                        }
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
                                                                            fullWidth
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                                <div className={styles.submitButton}>
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
