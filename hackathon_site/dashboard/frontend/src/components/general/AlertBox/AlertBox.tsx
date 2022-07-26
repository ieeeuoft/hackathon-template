import React, { ReactElement } from "react";
import { Alert, AlertTitle } from "@material-ui/lab";

interface ErrorBoxProps {
    error?: string[] | string;
    body?: ReactElement;
    type?: "error" | "info" | "success" | "warning";
    title?: string;
}

const AlertBox = ({ error, body, type, title, ...otherProps }: ErrorBoxProps) => {
    return (
        <Alert
            severity={type ?? "error"}
            style={{ margin: "15px 0px" }}
            {...otherProps}
        >
            {typeof error === "object" ? (
                <>
                    <AlertTitle>{title ?? "An error has occurred because:"}</AlertTitle>
                    <ul style={{ marginLeft: "20px" }} data-testid="alert-error-list">
                        {error.map((err, index) => (
                            <li key={index}>{err}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <AlertTitle>{title ?? "An error has occurred"}</AlertTitle>
                    {body || error}
                </>
            )}
        </Alert>
    );
};

export default AlertBox;
