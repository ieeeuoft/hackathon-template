import React from "react";
import styles from "./TitledPaper.module.scss";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

const TitledPaper = ({ title, children }) => (
    <>
        {title && (
            <Typography variant="h2" noWrap className={styles.title}>
                {title}
            </Typography>
        )}
        <Paper elevation={3} square={true} className={styles.paper}>
            {children}
        </Paper>
    </>
);

export default TitledPaper;
