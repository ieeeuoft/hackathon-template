import React from "react";
import { Formik } from "formik";
import { connect } from "react-redux";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import * as Yup from "yup";

import styles from "./LoginForm.module.scss";
import { logIn, loginSelector } from "slices/users/userSlice";

export const ERROR_MESSAGES = {
    emailInvalid: "Invalid email address",
    emailMissing: "Email is required",
    passwordMissing: "Password is required",
    credentialsInvalid: "The email or password is incorrect",
};

const loginFormSchema = Yup.object().shape({
    email: Yup.string()
        .email(ERROR_MESSAGES.emailInvalid)
        .required(ERROR_MESSAGES.emailMissing),
    password: Yup.string().required(ERROR_MESSAGES.passwordMissing),
});

export const TEST_IDS = {
    circularProgress: "circular-progress",
    alert: "alert",
    emailHelperText: "email-helper-text",
    passwordHelperText: "password-helper-text",
};

export const LoginForm = ({
    errors,
    handleChange,
    handleReset,
    handleSubmit,
    isLoading,
    requestFailure,
    values: { email, password },
}) => {
    const isInvalidCredentials = requestFailure && requestFailure.status === 400;
    const INVALID_CREDENTIALS_MESSAGE = isInvalidCredentials
        ? ERROR_MESSAGES.credentialsInvalid
        : null;

    return (
        <>
            {requestFailure && !isInvalidCredentials && (
                <Alert
                    className={styles.alert}
                    variant="filled"
                    severity="error"
                    data-testid={TEST_IDS.alert}
                >
                    {requestFailure.message}
                </Alert>
            )}
            <form className={styles.form} onReset={handleReset} onSubmit={handleSubmit}>
                <TextField
                    classes={{ root: styles.formTextField }}
                    error={"email" in errors || isInvalidCredentials}
                    helperText={errors.email || INVALID_CREDENTIALS_MESSAGE}
                    FormHelperTextProps={{ "data-testid": TEST_IDS.emailHelperText }}
                    id="email-input"
                    label="Email"
                    onChange={handleChange}
                    name="email"
                    value={email}
                    variant="outlined"
                />
                <TextField
                    className={styles.formTextField}
                    error={"password" in errors || isInvalidCredentials}
                    helperText={errors.password || INVALID_CREDENTIALS_MESSAGE}
                    FormHelperTextProps={{
                        "data-testid": TEST_IDS.passwordHelperText,
                    }}
                    id="password-input"
                    label="Password"
                    onChange={handleChange}
                    name="password"
                    type="password"
                    value={password}
                    variant="outlined"
                />
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading}
                    disableElevation
                >
                    Log In
                    {isLoading && (
                        <CircularProgress
                            className={styles.formCircularProgress}
                            size={20}
                            data-testid={TEST_IDS.circularProgress}
                        />
                    )}
                </Button>
            </form>
        </>
    );
};

export const EnhancedLoginForm = ({ handleLogin, isLoading, requestFailure }) => {
    const onSubmit = (formikValues) => {
        handleLogin({ email: formikValues.email, password: formikValues.password });
    };

    return (
        <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            validateOnBlur={false}
            validateOnChange={false}
            validationSchema={loginFormSchema}
        >
            {(formikProps) => (
                <LoginForm
                    {...formikProps}
                    isLoading={isLoading}
                    requestFailure={requestFailure}
                />
            )}
        </Formik>
    );
};

const mapStateToProps = (state) => ({
    isLoading: loginSelector(state).isLoading,
    requestFailure: loginSelector(state).failure,
});

const ConnectedEnhancedLoginForm = connect(mapStateToProps, { handleLogin: logIn })(
    EnhancedLoginForm
);

export default ConnectedEnhancedLoginForm;
