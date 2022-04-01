import React from "react";
// import styles from "./NotFound.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";

const NotFound = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">Error 404</Typography>
        </>
    );
};

export default NotFound;
