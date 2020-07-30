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
import Alert from "@material-ui/lab/Alert";

import * as Yup from "yup";
import { Formik } from "formik";

import styles from "./ProductOverview.module.scss";

export const ERROR_MESSAGES = {
    quantityMissing: "Quantity is required",
};

const addToCartFormSchema = Yup.object().shape({
    quantity: Yup.number().required(ERROR_MESSAGES.quantityMissing),
});

const createQuantityList = (number) => {
    let entry = [];

    for (let i = 1; i <= number; i++) {
        entry.push(
            <MenuItem key={i} role="quantity" value={i.toString()}>
                {i}
            </MenuItem>
        );
    }

    return entry;
};

export const AddToCartForm = ({
    availableQuantity,
    handleSubmit,
    handleChange,
    requestFailure,
    values: { quantity },
}) => {
    return (
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
    );
};

export const EnhancedAddToCartForm = ({
    handleSubmit,
    requestFailure,
    availableQuantity,
}) => {
    const onSubmit = (formikValues) => {
        handleSubmit(formikValues.quantity);
    };

    return (
        <Formik
            initialValues={{ quantity: "1" }}
            onSubmit={onSubmit}
            validateOnBlur={false}
            validationOnChange={false}
            validationSchema={addToCartFormSchema}
        >
            {(formikProps) => (
                <AddToCartForm
                    availableQuantity={availableQuantity}
                    handleSubmit={formikProps.handleSubmit}
                    handleChange={formikProps.handleChange}
                    requestFailure={requestFailure}
                    values={formikProps.values}
                />
            )}
        </Formik>
    );
};

const DetailInfoSection = ({
    manufacturer,
    model_num,
    datasheet,
    notes,
    constraints,
}) => {
    return (
        <div className={styles.detailInfoSection}>
            <div className={styles.bodyinfo}>
                <Typography variant="body2" className={styles.heading}>
                    Constraints
                </Typography>
                {constraints.map((constraint, i) => (
                    <Typography key={i} variant="body2">
                        {constraint}
                    </Typography>
                ))}
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2" className={styles.heading}>
                    Manufacturer
                </Typography>
                <Typography>{manufacturer}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2" className={styles.heading}>
                    Model Number
                </Typography>
                <Typography>{model_num}</Typography>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2" className={styles.heading}>
                    Datasheet
                </Typography>
                <Link
                    href={datasheet}
                    rel="noopener"
                    color="inherit"
                    underline="none"
                    target="_blank"
                    className={styles.bodyinfoDataSheet}
                >
                    <LaunchIcon />
                    <Typography>Link</Typography>
                </Link>
            </div>
            <div className={styles.bodyinfo}>
                <Typography variant="body2" className={styles.heading}>
                    Notes
                </Typography>
                <Typography variant="body2">{notes}</Typography>
            </div>
        </div>
    );
};

const MainSection = ({ name, total, quantityAvailable, categories, img }) => {
    let availability;
    if (quantityAvailable === 0) {
        availability = (
            <Typography className={styles.notAvailable}>OUT OF STOCK</Typography>
        );
    } else {
        availability = (
            <Typography className={styles.quantityAvailable}>
                {quantityAvailable} OF {total} IN STOCK
            </Typography>
        );
    }

    return (
        <div className={styles.mainsection}>
            <div>
                <div className={styles.title}>
                    <Typography variant="h2">{name}</Typography>
                </div>
                {availability}
                <div className={styles.category}>
                    <Typography variant="h2">Category</Typography>
                    {categories.map((category, i) => (
                        <Chip
                            label={category}
                            size="small"
                            className={styles.categoryItem}
                            key={i}
                        />
                    ))}
                </div>
            </div>
            <img src={img} alt="product" />
        </div>
    );
};

export const ProductOverview = ({ detail, addToCart }) => (
    <>
        <MainSection
            type={detail.type}
            name={detail.name}
            total={detail.total}
            quantityAvailable={detail.quantityAvailable}
            categories={detail.category}
            img={detail.img}
        />
        <DetailInfoSection
            manufacturer={detail.manufacturer}
            model_num={detail.model_num}
            datasheet={detail.datasheet}
            notes={detail.notes}
            constraints={detail.constraints}
        />
        {addToCart && (
            <EnhancedAddToCartForm
                handleSubmit={addToCart}
                requestFailure={false}
                availableQuantity={3}
            />
        )}
    </>
);
