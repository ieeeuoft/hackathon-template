import React from "react";
import styles from "./SideSheetLeft.module.scss";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";

const SideSheetLeft = ({title, children, toggleState, toggleFunc}) => (
    <Drawer
        anchor="left"
        open={toggleState}
        onClose={toggleFunc}
        className={styles.drawer}
    >
        <div className={styles.drawerTop}>
            <Typography variant="h2">
                {title}
            </Typography>
            <IconButton
                color="inherit"
                aria-label="CloseMenu"
                className={styles.iconBtn}
                onClick={toggleFunc}
            >
                <CloseIcon />
            </IconButton>
        </div>
        {children}
    </Drawer>
);

export default SideSheetLeft;