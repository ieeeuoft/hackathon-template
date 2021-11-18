import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LaunchIcon from "@material-ui/icons/Launch";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";

import * as Yup from "yup";
import { Formik, FormikValues } from "formik";

import styles from "./ProductOverview.module.scss";
import {
    displaySnackbar,
    hardwareBeingViewedSelector,
    isProductOverviewVisibleSelector,
    removeProductOverviewItem,
} from "slices/ui/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectCategoriesByIds } from "slices/hardware/categorySlice";
import { RootState } from "slices/store";
import { addToCart, cartSelectors } from "slices/hardware/cartSlice";

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

interface AddToCartFormProps extends FormikValues {
    quantityAvailable: number;
    maxPerTeam?: number;
}
export const AddToCartForm = ({
    quantityAvailable,
    maxPerTeam,
    handleSubmit,
    handleChange,
    values: { quantity },
}: AddToCartFormProps) => {
    const dropdownNum =
        maxPerTeam !== undefined
            ? Math.min(quantityAvailable, maxPerTeam)
            : quantityAvailable;

    return (
        <>
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
    quantityAvailable: number;
    hardwareId: number;
    name: string;
    maxPerTeam?: number;
}
export const EnhancedAddToCartForm = ({
    quantityAvailable,
    hardwareId,
    name,
    maxPerTeam,
}: EnhancedAddToCartFormProps) => {
    const dispatch = useDispatch();
    const currentQuantityInCart =
        useSelector((state: RootState) => cartSelectors.selectById(state, hardwareId))
            ?.quantity ?? 0;

    const onSubmit = (formikValues: { quantity: string }) => {
        const numQuantity: number = parseInt(formikValues.quantity);
        if (currentQuantityInCart + numQuantity <= (maxPerTeam || quantityAvailable)) {
            dispatch(addToCart({ hardware_id: hardwareId, quantity: numQuantity }));
            dispatch(
                displaySnackbar({
                    message: `Added ${numQuantity} ${name} item(s) to your cart.`,
                })
            );
        } else {
            dispatch(
                displaySnackbar({
                    message: `You've already added the maximum amount of this item to your cart.`,
                })
            );
        }
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
                    <Typography key={i}>- {constraint}</Typography>
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

export const ProductOverview = ({
    showAddToCartButton,
}: {
    showAddToCartButton: boolean;
}) => {
    let categoryNames: string[] = [];
    let maxPerTeam: number = Infinity;
    let constraints: string[] = [];

    const dispatch = useDispatch();
    const closeProductOverview = () => dispatch(removeProductOverviewItem());

    const isProductOverviewVisible: boolean = useSelector(
        isProductOverviewVisibleSelector
    );
    const hardware = useSelector(hardwareBeingViewedSelector);
    const categories = useSelector((state: RootState) =>
        selectCategoriesByIds(state, hardware?.categories || [])
    );
    if (categories.length > 0) {
        categoryNames = categories.map(
            (category) => category?.name ?? `Category ${category?.id}`
        );

        constraints = hardware?.max_per_team
            ? [`Max ${hardware.max_per_team} of this item`]
            : [];
        maxPerTeam = hardware?.max_per_team ?? Infinity;
        for (const category of categories) {
            if (category?.max_per_team) {
                constraints.push(
                    `Max ${category.max_per_team} of items under category ${category.name}`
                );
                maxPerTeam = Math.min(category.max_per_team, maxPerTeam);
            }
        }
    }

    return (
        <SideSheetRight
            title="Product Overview"
            isVisible={isProductOverviewVisible}
            handleClose={closeProductOverview}
        >
            {hardware ? (
                <div className={styles.productOverview}>
                    <div className={styles.productOverviewDiv}>
                        <MainSection
                            name={hardware.name}
                            quantityAvailable={hardware.quantity_available}
                            quantityRemaining={hardware.quantity_remaining}
                            categories={categoryNames}
                            picture={hardware.picture}
                        />
                        <DetailInfoSection
                            manufacturer={hardware.manufacturer}
                            modelNumber={hardware.model_number}
                            datasheet={hardware.datasheet}
                            notes={hardware.notes}
                            constraints={constraints}
                        />
                    </div>

                    {showAddToCartButton && (
                        <EnhancedAddToCartForm
                            quantityAvailable={hardware.quantity_available}
                            hardwareId={hardware.id}
                            name={hardware.name}
                            maxPerTeam={maxPerTeam}
                        />
                    )}
                </div>
            ) : (
                <Typography variant="subtitle2" align="center" paragraph>
                    Unable to display hardware. Please refresh page and try again.
                </Typography>
            )}
        </SideSheetRight>
    );
};

export default ProductOverview;
