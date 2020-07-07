import React from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LaunchIcon from "@material-ui/icons/Launch";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import styles from "./ProductOverview.module.scss";
import Alert from "@material-ui/lab/Alert";

import { Formik } from "formik";

const createQuantityList = (number) => {
    let entry = [];

    for (let i = 1; i <= number; i++) {
        let valueInString = i + "";
        entry.push(
            <MenuItem key={i} role="quantity" value={valueInString}>
                {i}
            </MenuItem>
        );
    }

    return entry;
};

export const CartForm = ({
    availableQuantity,
    handleSubmit,
    handleChange,
    requestFailure,
    values: { quantity },
}) => {
    if (!handleSubmit) {
        return false;
    }

    return (
        handleSubmit && (
            <>
                {requestFailure && (
                    <Alert className={styles.alert} variant="filled" severity="error">
                        {requestFailure.message}
                    </Alert>
                )}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <FormControl variant="outlined" className={styles.formControl}>
                        <InputLabel>Qty</InputLabel>
                        <Select
                            value={quantity}
                            role="selecter"
                            onChange={handleChange}
                            label="Qty"
                            name="quantity"
                        >
                            {createQuantityList(availableQuantity)}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        className={styles.cartButton}
                        type="submit"
                        onClick={handleSubmit}
                        disableElevation
                    >
                        ADD TO CART
                    </Button>
                </form>
            </>
        )
    );
};

export const EnhancedCartForm = ({ handleCart, requestFailure, availableQuantity }) => {
    const onSubmit = (formikValues) => {
        handleCart(formikValues.quantity);
    };

    return (
        handleCart && (
            <Formik
                initialValues={{ quantity: "1" }}
                onSubmit={onSubmit}
                validateOnBlur={false}
                validationOnChange={false}
                validationSchema={false}
            >
                {(formikProps) => (
                    <CartForm
                        availableQuantity={availableQuantity}
                        handleSubmit={formikProps.handleSubmit}
                        handleChange={formikProps.handleChange}
                        requestFailure={requestFailure}
                        values={formikProps.values}
                    />
                )}
            </Formik>
        )
    );
};

const BodySheet = ({ manufacturer, model_num, datasheet, notes, constraints }) => {
    return (
        <div className={styles.bodysheet}>
            <div className={styles.bodyinfo}>
                <Typography variant="body2">Manufacturer</Typography>
                <Typography>{manufacturer}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2">Model Number</Typography>
                <Typography>{model_num}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2">Datasheet</Typography>
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
                <Typography variant="body2">Notes</Typography>
                {notes.map((note, i) => (
                    <Typography key={i}>{note}</Typography>
                ))}
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2">Constraints</Typography>
                {constraints.map((constraint, i) => (
                    <Typography key={i}>{constraint}</Typography>
                ))}
            </div>
        </div>
    );
};

const HeaderSheet = ({ type, name, total, available, categories, img }) => {
    return (
        <div className={styles.headersheet}>
            <div>
                <div className={styles.title}>
                    <Typography variant="h2">{name}</Typography>
                </div>
                <Typography className={styles.available}>
                    {available} OF {total} IN STOCK
                </Typography>
                <div className={styles.category}>
                    <Typography variant="h2">Category</Typography>
                    {categories.map((category) => (
                        <Chip
                            label={category}
                            size="small"
                            className={styles.categoryItem}
                        />
                    ))}
                </div>
            </div>
            <img src={img} alt="product" />
        </div>
    );
};

const ProductOverview = ({ detail, addCartFunction }) => {
    return (
        <div>
            <HeaderSheet
                type={detail.type}
                name={detail.name}
                total={detail.total}
                available={detail.available}
                categories={detail.category}
                img={detail.img}
            />
            <BodySheet
                manufacturer={detail.manufacturer}
                model_num={detail.model_num}
                datasheet={detail.datasheet}
                notes={detail.notes}
                constraints={detail.constraints}
            />
            <CartForm values={{}} />
        </div>
    );
};

export default ProductOverview;
