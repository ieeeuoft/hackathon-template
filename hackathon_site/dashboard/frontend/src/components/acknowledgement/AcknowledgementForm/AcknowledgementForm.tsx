import React from "react";
import styles from "./AcknowledgementForm.module.scss";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import Typography from "@material-ui/core/Typography/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Button from "@material-ui/core/Button/Button";
import Modal from "@material-ui/core/Modal";
import FormGroup from "@material-ui/core/FormGroup";
import CircularProgress from "@material-ui/core/CircularProgress";
import Waver from "components/acknowledgement/AcknowledgementForm/Waver";
import { Formik, Field, FormikValues, FieldProps } from "formik";
import * as Yup from "yup";
import { Paper } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { createProfile } from "slices/users/userSlice";

interface AcknowledgementFormValues {
    eSignature: string;
    acknowledgeRules: boolean[];
}

export const ERROR_MESSAGES = {
    esignatureMissing: "e-signature is required",
    acknowledgeRulesMissing: "All checkboxes are required",
};

const acknowledgeFormSchema = Yup.object().shape({
    eSignature: Yup.string().required(ERROR_MESSAGES.esignatureMissing),
    acknowledgeRules: Yup.array()
        .min(4)
        .max(4)
        .required(ERROR_MESSAGES.acknowledgeRulesMissing),
});

interface CheckboxData {
    id: number;
    label: string;
}

export const acknowledgementCheckboxes: CheckboxData[] = [
    {
        id: 1,
        label: "I understand that making a request does not guarantee hardware. Hardware is given on a first-come-first-serve basis.",
    },
    {
        id: 2,
        label: "Each member of the team must provide government-issued photo ID to check out components. ID will be returned when all components are returned.",
    },
    {
        id: 3,
        label: "I cannot keep hardware/components lent out to me.",
    },
    {
        id: 4,
        label: "I will be held accountable for damaged or lost hardware. The handling of each instance is case by case.",
    },
];

const CustomCheckboxGroup = ({
    field,
    content,
}: FieldProps & { content: CheckboxData[] }) => (
    <FormGroup {...field}>
        {content.map((item, i) => (
            <div className={styles.acknowledgeCheckbox} key={i}>
                <FormControlLabel
                    name={field.name}
                    value={item.id}
                    control={<Checkbox color="primary" />}
                    label={item.label}
                    checked={field.value.includes(item.id.toString())}
                    key={i}
                />
            </div>
        ))}
    </FormGroup>
);

interface AcknowledgementFormProps {
    isLoading: boolean;
    values: AcknowledgementFormValues;
}

export const AcknowledgementForm = ({
    handleSubmit,
    handleChange,
    isLoading,
    values: { eSignature, acknowledgeRules },
}: FormikValues & AcknowledgementFormProps) => {
    const [openWaverModal, setOpenWaverModal] = React.useState(false);

    return (
        <>
            <Modal
                open={openWaverModal}
                onClose={() => setOpenWaverModal(false)}
                aria-labelledby="waver-modal-title"
                aria-describedby="waver-modal-description"
            >
                <div className={styles.acknowledgeModal}>{Waver}</div>
            </Modal>
            <form className={styles.acknowledge} onSubmit={handleSubmit}>
                <Field
                    name="acknowledgeRules"
                    component={CustomCheckboxGroup}
                    content={acknowledgementCheckboxes}
                />
                <br />
                <Typography variant="body1">
                    IN SIGNING THIS RELEASE, I ACKNOWLEDGE AND REPRESENT THAT I have
                    read the foregoing &nbsp;
                    <span
                        className={styles.acknowledgeLink}
                        onClick={() => setOpenWaverModal(true)}
                    >
                        Waiver of Liability and Hold Harmless Agreement
                    </span>
                    , understand it and sign it voluntarily as my own free act and deed;
                    no oral representations, statements, or inducements, apart from the
                    foregoing written agreement, have been made; I am at least eighteen
                    (18) years of age and fully competent; and I execute this Release
                    for full, adequate and complete consideration fully intending to be
                    bound by same.
                </Typography>
                <TextField
                    label="e-signature"
                    id="eSignature"
                    className={styles.acknowledgeSignature}
                    name="eSignature"
                    onChange={handleChange}
                    value={eSignature}
                    fullWidth
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={
                        isLoading ||
                        acknowledgeRules.length !== acknowledgementCheckboxes.length ||
                        eSignature === ""
                    }
                    disableElevation
                >
                    Continue
                    {isLoading && (
                        <CircularProgress
                            className={styles.formCircularProgress}
                            size={20}
                            data-testid="circularProgress"
                        />
                    )}
                </Button>
            </form>
        </>
    );
};

interface EnhancedAcknowledgementFormProps {
    requestFailure?: boolean;
    isLoading: boolean;
}

export const EnhancedAcknowledgmentForm = ({
    requestFailure,
    isLoading,
}: EnhancedAcknowledgementFormProps) => {
    const dispatch = useDispatch();

    const onSubmit = ({ eSignature, acknowledgeRules }: AcknowledgementFormValues) => {
        const allChecked = acknowledgeRules.length === acknowledgementCheckboxes.length;
        dispatch(
            createProfile({
                e_signature: eSignature,
                acknowledge_rules: allChecked,
            })
        );
    };

    const initialValues: AcknowledgementFormValues = {
        eSignature: "",
        acknowledgeRules: [],
    };

    return (
        <Paper className={styles.paper} elevation={3}>
            <Typography className={styles.title} variant="h1">
                ACKNOWLEDGEMENTS
            </Typography>
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validateOnBlur={false}
                validateOnChange={false}
                validationSchema={acknowledgeFormSchema}
            >
                {(formikProps) => (
                    <AcknowledgementForm
                        {...formikProps}
                        requestFailure={requestFailure}
                        isLoading={isLoading}
                    />
                )}
            </Formik>
        </Paper>
    );
};

export default EnhancedAcknowledgmentForm;
