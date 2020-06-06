import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LaunchIcon from "@material-ui/icons/Launch";

import styles from "./SideSheetR.module.scss";
import { ReactComponent as BackArrow } from "../../../assets/images/icons/BackArrow.svg";
import { ReactComponent as CircleType } from "../../../assets/images/icons/redtype.svg";

const createQuantityList = (number) => {
    var entry = [];

    for (var i = 0; i < number; i++) {
        entry.push(i + 1);
    }

    return entry;
};

const CartSheet = ({ cart, detail }) => {
    const handleChange = (value) => {
        alert(value);
    };

    if (cart) {
        return (
            <div className={styles.cart}>
                <FormControl className={styles.form}>
                    <Select>
                        {createQuantityList(detail.quantity).map((val, i) => (
                            <MenuItem onClick={() => handleChange(val)} key={i}>
                                {val}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    className={styles.cartButton}
                    onClick={cart}
                    disableElevation
                >
                    ADD TO CART
                </Button>
            </div>
        );
    } else {
        return null;
    }
};

const BodySheet = ({ detail }) => {
    return (
        <div className={styles.bodysheet}>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Manufacturer</Typography>
                <Typography variant="p">{detail.manufacturer}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Model Number</Typography>
                <Typography variant="p">{detail.model_num}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Datasheet</Typography>
                <Link
                    href={detail.datasheet}
                    rel="noopener"
                    color="inherit"
                    underline="none"
                    target="_blank"
                    style={{ display: "flex" }}
                >
                    <LaunchIcon></LaunchIcon>
                    <Typography variant="p">Link</Typography>
                </Link>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Notes</Typography>
                {detail.notes.map((note, i) => (
                    <Typography variant="p" key={i}>
                        {note}
                    </Typography>
                ))}
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Constraints</Typography>
                {detail.constraints.map((constraint, i) => (
                    <Typography variant="p" key={i}>
                        {constraint}
                    </Typography>
                ))}
            </div>
        </div>
    );
};

const HeaderSheet = ({ detail }) => {
    return (
        <div className={styles.headersheet}>
            <div>
                <div className={styles.title}>
                    <CircleType
                        style={{ color: detail.type, margin: "0 5px" }}
                    ></CircleType>
                    <Typography variant="h2">{detail.name}</Typography>
                </div>
                <Typography className={styles.available}>
                    {detail.available} OF {detail.total} IN STOCK
                </Typography>
                <div className={styles.tags}>
                    <Typography variant="h3">Tags</Typography>
                    <Typography variant="p">{detail.tags}</Typography>
                </div>
            </div>
            <img src={detail.img} alt="product" />
        </div>
    );
};

const SideSheetR = ({ detail, cart }) => {
    const [toggle, setToggle] = React.useState(false);

    const handleChange = (change) => {
        setToggle(change);
    };

    return (
        <div>
            <div
                onClick={() => {
                    handleChange(true);
                }}
            >
                click me
            </div>
            <Drawer anchor="right" open={toggle}>
                <div className={styles.topsheet}>
                    <BackArrow
                        className={styles.backarrow}
                        onClick={() => {
                            handleChange(false);
                        }}
                    />
                    <Typography variant="h2" className={styles.title}>
                        Product Overview
                    </Typography>
                </div>
                <HeaderSheet detail={detail} />
                <BodySheet detail={detail} />
                <CartSheet cart={cart} detail={detail} />
            </Drawer>
        </div>
    );
};

export default SideSheetR;
