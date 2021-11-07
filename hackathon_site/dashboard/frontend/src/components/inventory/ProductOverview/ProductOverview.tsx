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
import { ProductOverviewItem } from "../../../api/types";

export const ERROR_MESSAGES = {
    quantityMissing: "Quantity is required",
};

const addToCartFormSchema = Yup.object().shape({
    quantity: Yup.number().required(ERROR_MESSAGES.quantityMissing),
});

const createQuantityList = (number: number) => {
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

interface AddToCartFormProps {
    quantityAvailable: number;
    maxPerTeam: number;
    handleSubmit(): any;
    handleChange(): any;
    requestFailure: { message: string } | false;
    values: { quantity: number };
}
export const AddToCartForm = ({
    quantityAvailable,
    maxPerTeam,
    handleSubmit,
    handleChange,
    requestFailure,
    values: { quantity },
}: AddToCartFormProps) => {
    const dropdownNum = !maxPerTeam
        ? quantityAvailable
        : Math.min(quantityAvailable, maxPerTeam);

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
                        disableElevation
                    >
                        Add to cart
                    </Button>
                </div>
            </form>
        </>
    );
};

interface EnhancedAddToCartFormProps {
    handleSubmit(quantity: string): any;
    requestFailure: { message: string } | boolean;
    quantityAvailable: number;
    maxPerTeam: number;
}
export const EnhancedAddToCartForm = ({
    handleSubmit,
    requestFailure,
    quantityAvailable,
    maxPerTeam,
}: EnhancedAddToCartFormProps) => {
    const onSubmit = (formikValues: { quantity: string }) => {
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
                    maxPerTeam={maxPerTeam}
                    handleSubmit={formikProps.handleSubmit}
                    handleChange={formikProps.handleChange}
                    requestFailure={requestFailure}
                    values={formikProps.values}
                />
            )}
        </Formik>
    );
};

interface DetailInfoSectionProps {
    manufacturer: string;
    modelNumber: string;
    datasheet: string;
    notes: string;
    constraints: string[];
}
const DetailInfoSection = ({
    manufacturer,
    modelNumber,
    datasheet,
    notes,
    constraints,
}: DetailInfoSectionProps) => {
    return (
        <>
            <Typography variant="body2" color="secondary" className={styles.heading}>
                Constraints
            </Typography>
            {constraints?.length > 0 &&
                constraints.map((constraint, i) => (
                    <Typography key={i}>{constraint}</Typography>
                ))}
            <Typography variant="body2" className={styles.heading}>
                Manufacturer
            </Typography>
            <Typography>{manufacturer}</Typography>
            <Typography variant="body2" className={styles.heading}>
                Model Number
            </Typography>
            <Typography>{modelNumber}</Typography>
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

interface MainSectionProps {
    name: string;
    quantityAvailable: number;
    quantityRemaining: number;
    categories: string[];
    picture: string;
}
const MainSection = ({
    name,
    quantityAvailable,
    quantityRemaining,
    categories,
    picture,
}: MainSectionProps) => {
    const availability =
        quantityRemaining === 0 ? (
            <Typography color="secondary">OUT OF STOCK</Typography>
        ) : (
            <Typography className={styles.quantityAvailable}>
                {quantityRemaining} OF {quantityAvailable} IN STOCK
            </Typography>
        );

    return (
        <div className={styles.mainSection}>
            <div>
                <Typography variant="h6">{name}</Typography>
                {availability}
                <Typography variant="body2" className={styles.heading}>
                    Category
                </Typography>
                <div>
                    {categories?.length > 0 &&
                        categories.map((category, i) => (
                            <Chip
                                label={category}
                                size="small"
                                className={styles.categoryItem}
                                key={i}
                            />
                        ))}
                </div>
            </div>
            <img src={picture} alt={name} />
        </div>
    );
};

interface ProductOverviewProps {
    detail: ProductOverviewItem;
    addToCart(): any;
    isVisible: boolean;
    handleClose(): any;
}

export const ProductOverview = ({
    detail,
    addToCart,
    isVisible,
    handleClose,
}: ProductOverviewProps) => (
    <SideSheetRight
        title="Product Overview"
        isVisible={isVisible}
        handleClose={handleClose}
    >
        {detail && (
            <div className={styles.productOverview}>
                <div className={styles.productOverviewDiv}>
                    <MainSection
                        name={detail.name}
                        quantityAvailable={detail.quantity_available}
                        quantityRemaining={detail.quantity_remaining}
                        categories={detail.categories}
                        picture={detail.picture}
                    />
                    <DetailInfoSection
                        manufacturer={detail.manufacturer}
                        modelNumber={detail.model_number}
                        datasheet={detail.datasheet}
                        notes={detail.notes}
                        constraints={detail.constraints}
                    />
                </div>

                {addToCart && (
                    <EnhancedAddToCartForm
                        handleSubmit={addToCart}
                        requestFailure={false}
                        quantityAvailable={detail.quantity_available}
                        maxPerTeam={detail.max_per_team}
                    />
                )}
            </div>
        )}
    </SideSheetRight>
);

export default ProductOverview;
