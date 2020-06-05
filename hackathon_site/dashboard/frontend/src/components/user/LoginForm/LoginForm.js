import React from "react";
import { Formik } from "formik";
import Button from "@material-ui/core/Button";
import styles from "./LoginForm.module.scss";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import * as Yup from "yup";

export const ERROR_MESSAGES = {
    emailInvalid: "Invalid email address",
    emailMissing: "Email is required",
    passwordMissing: "Password is required",
};

const loginFormSchema = Yup.object().shape({
    email: Yup.string()
        .email(ERROR_MESSAGES.emailInvalid)
        .required(ERROR_MESSAGES.emailMissing),
    password: Yup.string().required(ERROR_MESSAGES.passwordMissing),
});

export const LoginForm = ({
    errors,
    handleChange,
    handleReset,
    handleSubmit,
    values: { email, password },
}) => {
    return (
        <form className={styles.form} onReset={handleReset} onSubmit={handleSubmit}>
            <TextField
                classes={{ root: styles.formTextField }}
                error={"email" in errors}
                helperText={errors.email || null}
                id="email-input"
                label="Email"
                onChange={handleChange}
                name="email"
                value={email}
                variant="outlined"
            />
            <TextField
                className={styles.formTextField}
                error={"password" in errors}
                helperText={errors.password || null}
                id="password-input"
                label="Password"
                onChange={handleChange}
                name="password"
                type="password"
                value={password}
                variant="outlined"
            />
            <Button type="submit" onClick={handleSubmit} variant="contained">
                <Typography>Log In</Typography>
            </Button>
        </form>
    );
};

export const EnhancedLoginForm = ({ handleLogin }) => {
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
            {(formikProps) => <LoginForm {...formikProps} />}
        </Formik>
    );
};

const ConnectedEnhancedLoginForm = () => {
    // Placeholder for redux connect()ed component
    const handleLogin = (props) => {
        console.log(props);
    };
    return <EnhancedLoginForm handleLogin={handleLogin} />;
};

export default ConnectedEnhancedLoginForm;
