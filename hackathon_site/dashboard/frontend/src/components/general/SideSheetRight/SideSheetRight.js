import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LaunchIcon from "@material-ui/icons/Launch";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import styles from "./SideSheetRight.module.scss";

const createQuantityList = (number, handleChange) => {
    let entry = [];

    for (let i = 1; i <= number; i++) {
        entry.push(
            <MenuItem onClick={() => handleChange(i)} key={i} role="quantity">
                {i}
            </MenuItem>
        );
    }

    return entry;
};

const CartSheet = ({ addCartFunction, quantity }) => {
    const [item, setItem] = React.useState("");

    const handleChange = (value) => {
        setItem(value);
    };

    return (
        addCartFunction && (
            <div className={styles.cart}>
                <FormControl className={styles.form}>
                    <Select value={item} role="selected">
                        {createQuantityList(quantity, handleChange)}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    className={styles.cartButton}
                    onClick={addCartFunction}
                    disableElevation
                >
                    ADD TO CART
                </Button>
            </div>
        )
    );
};

const BodySheet = ({ manufacturer, model_num, datasheet, notes, constraints }) => {
    return (
        <div className={styles.bodysheet}>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Manufacturer</Typography>
                <Typography>{manufacturer}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Model Number</Typography>
                <Typography>{model_num}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Datasheet</Typography>
                <Link
                    href={datasheet}
                    rel="noopener"
                    color="inherit"
                    underline="none"
                    target="_blank"
                    className={styles.bodyinfoDataSheet}
                >
                    <LaunchIcon></LaunchIcon>
                    <Typography>Link</Typography>
                </Link>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Notes</Typography>
                {notes.map((note, i) => (
                    <Typography key={i}>{note}</Typography>
                ))}
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="h3">Constraints</Typography>
                {constraints.map((constraint, i) => (
                    <Typography key={i}>{constraint}</Typography>
                ))}
            </div>
        </div>
    );
};

const HeaderSheet = ({ type, name, total, available, tags, img }) => {
    return (
        <div className={styles.headersheet}>
            <div>
                <div className={styles.title}>
                    <FiberManualRecordIcon style={{ color: type, margin: "0 5px" }} />
                    <Typography variant="h2">{name}</Typography>
                </div>
                <Typography className={styles.available}>
                    {available} OF {total} IN STOCK
                </Typography>
                <div className={styles.tags}>
                    <Typography variant="h3">Tags</Typography>
                    <Typography>{tags}</Typography>
                </div>
            </div>
            <img src={img} alt="product" />
        </div>
    );
};

const SideSheetRight = ({ detail, addCartFunction }) => {
    const [toggle, setToggle] = React.useState(false);

    const toggleSheet = (change) => {
        setToggle(change);
    };

    return (
        <div>
            <div
                onClick={() => {
                    toggleSheet(true);
                }}
            >
                click me
            </div>
            <Drawer anchor="right" open={toggle}>
                <div className={styles.topsheet}>
                    <ArrowBackIcon
                        className={styles.backarrow}
                        onClick={() => {
                            toggleSheet(false);
                        }}
                        role="close"
                    />
                    <Typography variant="h2" className={styles.title}>
                        Product Overview
                    </Typography>
                </div>
                <HeaderSheet
                    type={detail.type}
                    name={detail.name}
                    total={detail.total}
                    available={detail.available}
                    tags={detail.tags}
                    img={detail.img}
                />
                <BodySheet
                    manufacturer={detail.manufacturer}
                    model_num={detail.model_num}
                    datasheet={detail.datasheet}
                    notes={detail.notes}
                    constraints={detail.constraints}
                />
                <CartSheet
                    addCartFunction={addCartFunction}
                    quantity={detail.quantity}
                />
            </Drawer>
        </div>
    );
};

export default SideSheetRight;
