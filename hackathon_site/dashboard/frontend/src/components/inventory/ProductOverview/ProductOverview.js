import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LaunchIcon from "@material-ui/icons/Launch";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import Alert from "@material-ui/lab/Alert";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";

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
    quantityAvailable,
    constraintMax,
    handleSubmit,
    handleChange,
    requestFailure,
    values: { quantity },
}) => {
    let dropdownNum;
    if (!constraintMax) {
        dropdownNum = quantityAvailable;
    } else {
        dropdownNum = Math.min(quantityAvailable, constraintMax);
    }

    return (
        <>
            {requestFailure && (
                <Alert variant="filled" severity="error">
                    {requestFailure.message}
                </Alert>
            )}
            <form className={styles.form} onSubmit={handleSubmit}>
                <FormControl variant="outlined" className={styles.formControl}>
                    <InputLabel id="qtyLabel">Qty</InputLabel>
                    <Select
                        value={dropdownNum === 0 ? "" : quantity}
                        onChange={handleChange}
                        label="Qty"
                        labelId="qtyLabel"
                        name="quantity"
                        disabled={dropdownNum === 0}
                    >
                        {createQuantityList(dropdownNum)}
                    </Select>
                </FormControl>
                <div className={styles.formButton}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth={true}
                        size="large"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={dropdownNum === 0}
                    >
                        Add to cart
                    </Button>
                </div>
            </form>
        </>
    );
};

export const EnhancedAddToCartForm = ({
    handleSubmit,
    requestFailure,
    quantityAvailable,
    constraintMax,
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
                    quantityAvailable={quantityAvailable}
                    constraintMax={constraintMax}
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
        <>
            <Typography variant="body2" color="secondary" className={styles.heading}>
                Constraints
            </Typography>
            {constraints.map((constraint, i) => (
                <Typography key={i}>{constraint}</Typography>
            ))}
            <Typography variant="body2" className={styles.heading}>
                Manufacturer
            </Typography>
            <Typography>{manufacturer}</Typography>
            <Typography variant="body2" className={styles.heading}>
                Model Number
            </Typography>
            <Typography>{model_num}</Typography>
            <Typography variant="body2" className={styles.heading}>
                Datasheet
            </Typography>
            <Button
                href={datasheet}
                rel="noopener"
                target="_blank"
                startIcon={<LaunchIcon />}
            >
                Link
            </Button>
            <Typography variant="body2" className={styles.heading}>
                Notes
            </Typography>
            {notes.split("\n").map((note, i) => (
                <Typography key={i}>{note}</Typography>
            ))}
        </>
    );
};

const MainSection = ({ name, total, quantityAvailable, categories, img }) => {
    let availability;
    if (quantityAvailable === 0) {
        availability = <Typography color="secondary">OUT OF STOCK</Typography>;
    } else {
        availability = (
            <Typography className={styles.quantityAvailable}>
                {quantityAvailable} OF {total} IN STOCK
            </Typography>
        );
    }

    return (
        <div className={styles.mainSection}>
            <div className={styles.mainSectionName}>
                <div>
                    <Typography variant="h6">{name}</Typography>
                    {availability}
                </div>

                <div>
                    <Typography variant="body2" className={styles.heading}>
                        Category
                    </Typography>
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
            <img src={img} alt={name} />
        </div>
    );
};

export const ProductOverview = ({ detail, addToCart, isVisible, handleClose }) => (
    <SideSheetRight
        title="Product Overview"
        isVisible={isVisible}
        handleClose={handleClose}
    >
        <div className={styles.productOverview}>
            <div className={styles.productOverviewDiv}>
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
            </div>

            {addToCart && (
                <EnhancedAddToCartForm
                    handleSubmit={addToCart}
                    requestFailure={false}
                    quantityAvailable={detail.quantityAvailable}
                    constraintMax={detail.constraintMax}
                />
            )}
        </div>
    </SideSheetRight>
);

export default ProductOverview;
