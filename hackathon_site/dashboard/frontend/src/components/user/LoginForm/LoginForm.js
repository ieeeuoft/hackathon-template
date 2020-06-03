import React from "react";
import { Form, withFormik } from "formik";
import Button from "@material-ui/core/Button";
import styles from "./LoginForm.module.scss";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import * as Yup from "yup";

export const ERROR_MESSAGES = {
    emailInvalid: "Invalid email address",
    emailMissing: "Required",
    passwordMissing: "Required",
};

const loginFormSchema = Yup.object().shape({
    email: Yup.string()
        .email(ERROR_MESSAGES.emailInvalid)
        .required(ERROR_MESSAGES.emailMissing),
    password: Yup.string().required(ERROR_MESSAGES.passwordMissing),
});

const LoginForm = ({
    errors,
    handleChange,
    handleSubmit,
    values: { email, password },
}) => {
    return (
        <Form className={styles.form}>
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
        </Form>
    );
};

const EnhancedLoginForm = withFormik({
    mapPropsToValues: (props) => ({ email: "", password: "" }),
    handleSubmit: (values) => {
        console.log(values);
    },
    validationSchema: loginFormSchema,
    validateOnChange: false,
    validateOnBlur: false,
})(LoginForm);

export default EnhancedLoginForm;
