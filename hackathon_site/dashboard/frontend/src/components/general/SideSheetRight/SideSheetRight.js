import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import styles from "./SideSheetRight.module.scss";

const SideSheetRight = ({ children, title }) => {
    const [toggle, setToggle] = React.useState(false);

    const toggleSheet = (change) => {
        setToggle(change);
    };

    return (
        <div>
            <Button
                onClick={() => {
                    toggleSheet(true);
                }}
            >
                open SideSheetRight
            </Button>
            <Drawer anchor="right" open={toggle}>
                <div className={styles.topsheet}>
                    <IconButton
                        className={styles.backarrow}
                        onClick={() => {
                            toggleSheet(false);
                        }}
                        role="close"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h2" className={styles.title}>
                        {title}
                    </Typography>
                </div>
                {children}
            </Drawer>
        </div>
    );
};

export default SideSheetRight;
