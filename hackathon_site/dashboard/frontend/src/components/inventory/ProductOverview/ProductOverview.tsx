import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LaunchIcon from "@material-ui/icons/Launch";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";

import * as Yup from "yup";
import { Formik, FormikValues } from "formik";

import styles from "./ProductOverview.module.scss";
import {
    closeProductOverview,
    displaySnackbar,
    isProductOverviewVisibleSelector,
} from "slices/ui/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectCategoriesByIds } from "slices/hardware/categorySlice";
import { RootState } from "slices/store";
import { addToCart, cartSelectors } from "slices/hardware/cartSlice";
import {
    hardwareInProductOverviewSelector,
    isUpdateDetailsLoading,
    removeProductOverviewItem,
} from "slices/hardware/hardwareSlice";
import { Category } from "api/types";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import { hardwareSignOutEndDate, hardwareSignOutStartDate } from "constants.js";
import { Tooltip } from "@material-ui/core";
import { userTypeSelector, isTestUserSelector } from "slices/users/userSlice";

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
    quantityRemaining: number;
    maxPerTeam: number | null;
}
export const AddToCartForm = ({
    quantityRemaining,
    maxPerTeam,
    handleSubmit,
    handleChange,
    values: { quantity },
}: AddToCartFormProps) => {
    const isTestUser = useSelector(isTestUserSelector);
    const dropdownNum =
        maxPerTeam !== null
            ? Math.min(quantityRemaining, maxPerTeam)
            : quantityRemaining;

    const currentDateTime = new Date();
    const isOutsideSignOutPeriod =
        currentDateTime < hardwareSignOutStartDate ||
        currentDateTime > hardwareSignOutEndDate;

    const addToCartButton = (
        <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            size="large"
            type="submit"
            onClick={handleSubmit}
            disabled={dropdownNum === 0 || (!isTestUser && isOutsideSignOutPeriod)}
            disableElevation
        >
            Add to cart
        </Button>
    );
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
                    {isOutsideSignOutPeriod ? (
                        <Tooltip title="You cannot add items to cart because hardware sign out period has not begun or is already over">
                            <span> {addToCartButton} </span>
                        </Tooltip>
                    ) : (
                        addToCartButton
                    )}
                </div>
            </form>
        </>
    );
};

interface EnhancedAddToCartFormProps {
    quantityRemaining: number;
    hardwareId: number;
    name: string;
    maxPerTeam: number | null;
}
export const EnhancedAddToCartForm = ({
    quantityRemaining,
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
        if (currentQuantityInCart + numQuantity <= (maxPerTeam ?? quantityRemaining)) {
            dispatch(addToCart({ hardware_id: hardwareId, quantity: numQuantity }));
            dispatch(
                displaySnackbar({
                    message: `Added ${numQuantity} ${name} item(s) to your cart.`,
                    options: {
                        variant: "success",
                    },
                })
            );
        } else {
            dispatch(
                displaySnackbar({
                    message: `Adding this amount to your cart will exceed the quantity limit for this item.`,
                    options: {
                        variant: "warning",
                    },
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
                <>
                    {currentQuantityInCart > 0 && (
                        <Typography
                            variant="body2"
                            color="primary"
                            className={styles.heading}
                        >
                            You currently have {currentQuantityInCart} of this item in
                            your cart.
                        </Typography>
                    )}
                    <AddToCartForm
                        quantityRemaining={quantityRemaining}
                        maxPerTeam={maxPerTeam}
                        handleSubmit={formikProps.handleSubmit}
                        handleChange={formikProps.handleChange}
                        values={formikProps.values}
                    />
                </>
            )}
        </Formik>
    );
};

interface DetailInfoSectionProps {
    manufacturer: string;
    modelNumber: string;
    datasheet: string;
    notes?: string;
    constraints: string[];
}
export const DetailInfoSection = ({
    manufacturer,
    modelNumber,
    datasheet,
    notes,
    constraints,
}: DetailInfoSectionProps) => {
    return (
        <>
            {constraints?.length > 0 && (
                <>
                    <Typography
                        variant="body2"
                        color="secondary"
                        className={styles.heading}
                    >
                        Constraints
                    </Typography>
                    {constraints.map((constraint, i) => (
                        <Typography key={i}>- {constraint}</Typography>
                    ))}
                </>
            )}
            <Typography variant="body2" className={styles.heading}>
                Manufacturer
            </Typography>
            <Typography>{manufacturer}</Typography>
            {modelNumber && (
                <>
                    <Typography variant="body2" className={styles.heading}>
                        Model Number
                    </Typography>
                    <Typography>{modelNumber}</Typography>
                </>
            )}
            {datasheet && (
                <>
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
                </>
            )}
            {notes && (
                <>
                    <Typography variant="body2" className={styles.heading}>
                        Notes
                    </Typography>
                    {notes.split("\n").map((note, i) => (
                        <Typography key={i}>{note}</Typography>
                    ))}
                </>
            )}
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
    const userType = useSelector(userTypeSelector);
    const availability =
        quantityRemaining === 0 ? (
            <Typography color="secondary">OUT OF STOCK</Typography>
        ) : userType === "participant" ? (
            <Typography className={styles.quantityAvailable}>
                {Math.max(quantityRemaining, 0)} IN STOCK
            </Typography>
        ) : (
            <Typography className={styles.quantityAvailable}>
                {Math.max(quantityRemaining, 0)} OF {quantityAvailable} IN STOCK
            </Typography>
        );

    return (
        <div className={styles.mainSection}>
            <div>
                <Typography variant="h6">{name}</Typography>
                {availability}
                {categories.length > 0 && (
                    <>
                        <Typography variant="body2" className={styles.heading}>
                            Category
                        </Typography>
                        <div>
                            {categories.map((category, i) => (
                                <Chip
                                    label={category}
                                    size="small"
                                    className={styles.categoryItem}
                                    key={i}
                                />
                            ))}
                        </div>
                    </>
                )}
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
    let maxPerTeam: number | null = null;
    let constraints: string[] = [];

    const isLoading = useSelector(isUpdateDetailsLoading);

    const dispatch = useDispatch();
    const closeProductOverviewPanel = () => {
        dispatch(closeProductOverview());
        dispatch(removeProductOverviewItem());
    };

    const isProductOverviewVisible: boolean = useSelector(
        isProductOverviewVisibleSelector
    );
    const hardware = useSelector(hardwareInProductOverviewSelector);
    const categories = useSelector((state: RootState) =>
        selectCategoriesByIds(state, hardware?.categories || [])
    );

    maxPerTeam = hardware?.max_per_team ?? null;
    constraints = !!hardware?.max_per_team
        ? [`Max ${hardware.max_per_team} of this item`]
        : [];

    if (categories.length > 0) {
        categoryNames = categories
            .filter((category): category is Category => !!category)
            .map((category) => category.name);
        for (const category of categories) {
            if (category?.max_per_team !== undefined) {
                constraints.push(
                    `Max ${category.max_per_team} of items under category ${category.name}`
                );
                maxPerTeam =
                    maxPerTeam === null
                        ? category.max_per_team
                        : Math.min(category.max_per_team, maxPerTeam);
            }
        }
    }

    return (
        <SideSheetRight
            title="Product Overview"
            isVisible={isProductOverviewVisible}
            handleClose={closeProductOverviewPanel}
        >
            {isLoading ? (
                <CircularProgress
                    data-testid="circular-progress"
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                    }}
                />
            ) : hardware ? (
                <div className={styles.productOverview}>
                    <div className={styles.productOverviewDiv}>
                        <MainSection
                            name={hardware.name}
                            quantityAvailable={hardware.quantity_available}
                            quantityRemaining={hardware.quantity_remaining}
                            categories={categoryNames}
                            picture={
                                hardware.picture ??
                                hardware.image_url ??
                                hardwareImagePlaceholder
                            }
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
                            quantityRemaining={hardware.quantity_remaining}
                            hardwareId={hardware.id}
                            name={hardware.name}
                            maxPerTeam={maxPerTeam}
                        />
                    )}
                </div>
            ) : (
                <Typography variant="subtitle2" align="center" paragraph>
                    Unable to display hardware. Please refresh the page and try again.
                </Typography>
            )}
        </SideSheetRight>
    );
};

export default ProductOverview;
