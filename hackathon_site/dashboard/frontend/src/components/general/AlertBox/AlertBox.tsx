import React from "react";
import { Alert, AlertTitle } from "@material-ui/lab";

interface ErrorBoxProps {
    error: string[] | string;
    type?: "error" | "info" | "success" | "warning";
    title?: string;
}

const AlertBox = ({ error, type, title }: ErrorBoxProps) => {
    return (
        <Alert severity={type ?? "error"} style={{ margin: "15px 0px" }}>
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
                error
            )}
        </Alert>
    );
};

export default AlertBox;
