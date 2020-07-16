import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import styles from "./SideSheetRight.module.scss";

const SideSheetRight = ({ children, title, isVisible, handleClose }) => {
    // const [isVisible, setIsVisible] = React.useState(false);

    // const changeVisibleSheet = (change) => {
    //     setIsVisible(change);
    // };

    return (
        <div>
            {/* <Button
                onClick={() => {
                    changeVisibleSheet(true);
                }}
            >
                open SideSheetRight
            </Button> */}
            <Drawer anchor="right" open={isVisible}>
                <div className={styles.topsheet}>
                    <IconButton
                        className={styles.backarrow}
                        // onClick={() => {
                        //     changeVisibleSheet(false);
                        // }}
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
        </div>
    );
};

export default SideSheetRight;
