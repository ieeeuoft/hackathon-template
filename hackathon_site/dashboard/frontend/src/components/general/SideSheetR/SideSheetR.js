import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

import styles from "./SideSheetR.module.scss";
import { ReactComponent as BackArrow } from "../../../assets/images/icons/BackArrow.svg";

const BodySheet = () => {
    return <p>body</p>;
};

const HeaderSheet = () => {
    return <p>header</p>;
};

const SideSheetR = () => {
    return (
        <Drawer anchor="right" open={true}>
            <div className={styles.topsheet}>
                <BackArrow className={styles.backarrow} />
                <Typography variant="h2" className={styles.title}>
                    Product Overview
                </Typography>
            </div>
            <HeaderSheet />
            <BodySheet />
        </Drawer>
    );
};

export default SideSheetR;
