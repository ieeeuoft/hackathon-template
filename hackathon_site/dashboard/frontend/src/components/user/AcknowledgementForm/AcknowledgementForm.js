import React from "react";
import styles from "./AcknowledgementForm.module.scss";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import Typography from "@material-ui/core/Typography/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Button from "@material-ui/core/Button/Button";
import Link from "@material-ui/core/Link/Link";
import { Formik, Field } from "formik";

export const ERROR_MESSAGES = {
    signatureMissing: "e-signature is required",
    checkboxMissing: "All checkboxes are required",
};

export const FormikCheckBox = (props) => {
    return (
        <Field name={props.name}>
            {({ field, form }) => (
                <label>
                    <input
                        type="checkbox"
                        {...props}
                        checked={field.value.includes(props.value)}
                        onChange={() => {
                            if (field.value.includes(props.value)) {
                                const nextValue = field.value.filter(
                                    (value) => value !== props.value
                                );
                                form.setFieldValue(props.name, nextValue);
                            } else {
                                const nextValue = field.value.concat(props.value);
                                form.setFieldValue(props.name, nextValue);
                            }
                        }}
                    />
                    {props.value}
                </label>
            )}
        </Field>
    );
};

export const AcknowledgementForm = ({ handleContinue, openDoc }) => {
    const checkBox1 =
        "I understand that making a request does not guarantee hardware. Hardware is given on a first-come-first-serve basis.";
    const checkBox2 =
        "Each member of the team must provide government-issued photo ID to check out components. ID will be returned when all components are returned.";
    const checkBox3 = " I cannot keep hardware/components lent out to me.";
    const checkBox4 =
        "I will be held accountable for damaged or lost hardware. The handling of each instance is case by case.";
    const firstHalf =
        "IN SIGNING THIS RELEASE, I ACKNOWLEDGE AND REPRESENT THAT I have read the foregoing ";
    const secondHalf =
        ", understand it and sign it voluntarily as my own free act and deed; no oral representations, statements, or inducements, apart from the foregoing written agreement, have been made; I am at least eighteen (18) years of age and fully competent; and I execute this Release for full, adequate and complete consideration fully intending to be bound by same.";

    return (
        // <form className={styles.acknowledge} onSubmit={handleContinue}>
        //     <FormControlLabel
        //         control={<Checkbox name="firstCheck" />}
        //         label={checkBox1}
        //     />
        //     <FormControlLabel
        //         control={<Checkbox name="secondCheck" />}
        //         label={checkBox2}
        //     />
        //     <FormControlLabel
        //         control={<Checkbox name="thirdCheck" />}
        //         label={checkBox3}
        //     />
        //     <FormControlLabel
        //         control={<Checkbox name="forthCheck" />}
        //         label={checkBox4}
        //     />
        //     <Typography variant="body1" className={styles.acknowledgeText}>
        //         {firstHalf}
        //         <Link href="#" onClick={openDoc}>
        //             Waiver of Liability and Hold Harmless Agreement
        //         </Link>
        //         {secondHalf}
        //     </Typography>
        //     <TextField
        //         label="e-signature"
        //         className={styles.acknowledgeSignature}
        //         name="signature"
        //     />
        //     <Button
        //         type="submit"
        //         className={styles.acknowledgeButton}
        //         variant="contained"
        //         color="primary"
        //         onClick={handleContinue}
        //     >
        //         Continue
        //     </Button>
        // </form>
        <div className={styles.acknowledge} onSubmit={handleContinue}>
            <FormikCheckBox
                name="agreement"
                value={checkBox1}
                className={styles.acknowledgeCheckbox}
            />
            <FormikCheckBox
                name="agreement"
                value={checkBox2}
                className={styles.acknowledgeCheckbox}
            />
            <FormikCheckBox
                name="agreement"
                value={checkBox3}
                className={styles.acknowledgeCheckbox}
            />
            <FormikCheckBox
                name="agreement"
                value={checkBox4}
                className={styles.acknowledgeCheckbox}
            />
            <Typography variant="body1" className={styles.acknowledgeText}>
                {firstHalf}
                <Link href="#" onClick={openDoc}>
                    Waiver of Liability and Hold Harmless Agreement
                </Link>
                {secondHalf}
            </Typography>
            <TextField
                label="e-signature"
                className={styles.acknowledgeSignature}
                name="signature"
            />
            <Button
                type="submit"
                className={styles.acknowledgeButton}
                variant="contained"
                color="primary"
                onClick={handleContinue}
            >
                Continue
            </Button>
        </div>
    );
};

export const EnhancedAcknowledgmentForm = ({
    handleSubmit,
    requestFailure,
    openDoc,
}) => {
    const onSubmit = (formikValues) => {
        handleSubmit({ signature: formikValues.signature });
    };

    return (
        <Formik
            initialValues={{ signature: "", agreement: [""] }}
            onSubmit={onSubmit}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {(formikProps) => (
                <AcknowledgementForm
                    {...formikProps}
                    openDoc={openDoc}
                    handleContinue={onSubmit}
                    requestFailure={requestFailure}
                />
            )}
        </Formik>
    );
};

// const mapStateToProps = (state) => ({
//     isLoading: acknowledgeSelector(state).isLoading,
//     requestFailure: acknowledgeSelector(state).failure,
// });

// const ConnectedEnhancedLoginForm = connect(mapStateToProps, { handleLogin: handleSignIn })(
//     EnhancedAcknowledgmentForm
// );

export default EnhancedAcknowledgmentForm;
