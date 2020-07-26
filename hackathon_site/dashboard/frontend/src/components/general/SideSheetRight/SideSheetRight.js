import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import styles from "./SideSheetRight.module.scss";

const SideSheetRight = ({ children, title, isVisible, handleClose }) => {
    return (
        <Drawer anchor="right" open={isVisible}>
            <div className={styles.topsheet}>
                <IconButton
                    className={styles.backarrow}
                    onClick={handleClose}
                    role="close"
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h2" className={styles.title} role="title">
                    {title}
                </Typography>
            </div>
            {children}
        </Drawer>
    );
};

export default SideSheetRight;
