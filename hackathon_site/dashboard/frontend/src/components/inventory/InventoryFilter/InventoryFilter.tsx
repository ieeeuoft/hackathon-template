import React from "react";
import { Formik, Field, FieldProps, FormikValues } from "formik";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import { useDispatch, useSelector } from "react-redux";

import { Category, HardwareFilters, HardwareOrdering } from "api/types";
import {
    isLoadingSelector as isHardwareLoadingSelector,
    getHardwareWithFilters,
    setFilters,
    clearFilters,
} from "slices/hardware/hardwareSlice";
import {
    categorySelectors,
    isLoadingSelector as isCategoriesLoadingSelector,
} from "slices/hardware/categorySlice";
import styles from "components/sharedStyles/Filter.module.scss";
type OrderByOptions = {
    value: HardwareOrdering;
    label: string;
}[];

export const orderByOptions: OrderByOptions = [
    { value: "", label: "Default" },
    { value: "name", label: "A-Z" },
    { value: "-name", label: "Z-A" },
    { value: "-quantity_remaining", label: "Stock remaining: high to low" },
    { value: "quantity_remaining", label: "Stock remaining: low to high" },
];

const RadioOrderBy = ({ field, options }: FieldProps & { options: OrderByOptions }) => (
    <RadioGroup {...field} name={field.name}>
        {options.map((item, i) => (
            <FormControlLabel
                name={field.name}
                value={item.value}
                label={item.label}
                control={<Radio color="primary" />}
                checked={field.value === item.value}
                key={i}
            />
        ))}
    </RadioGroup>
);

const CheckboxCategory = ({ field, options }: FieldProps & { options: Category[] }) => (
    <FormGroup {...field}>
        {options.map((item, i) => (
            <div className={styles.filterCategory} key={i}>
                <FormControlLabel
                    name={field.name}
                    value={item.id}
                    control={<Checkbox color="primary" />}
                    label={item.name}
                    checked={field.value.includes(item.id.toString())}
                />
                <Chip
                    size="small"
                    // TODO: Was item.qty, but that's not a thing on categories right now
                    label={item.unique_hardware_count}
                    className={styles.filterCategoryChip}
                />
            </div>
        ))}
    </FormGroup>
);

const CheckboxAvailability = ({ field, ...props }: FieldProps) => (
    <FormGroup {...field} {...props}>
        <FormControlLabel
            label="In stock"
            name={field.name}
            value={true}
            control={<Checkbox color="primary" />}
            checked={field.value}
        />
    </FormGroup>
);

interface InventoryFilterValues {
    ordering: HardwareOrdering;
    in_stock: boolean;
    // Categories is a string array because html checkboxes have string values
    categories: string[];
}

export const InventoryFilter = ({ handleReset, handleSubmit }: FormikValues) => {
    const categories = useSelector(categorySelectors.selectAll);
    const isCategoriesLoading = useSelector(isCategoriesLoadingSelector);
    const isHardwareLoading = useSelector(isHardwareLoadingSelector);
    return (
        <div className={styles.filter}>
            <Paper
                elevation={2}
                className={styles.filterPaper}
                square={true}
                style={{ padding: "0px" }}
            >
                <form onReset={handleReset} onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>
                            <Typography variant="h2">Order by</Typography>
                        </legend>
                        <Field
                            name="ordering"
                            component={RadioOrderBy}
                            options={orderByOptions}
                        />
                    </fieldset>
                    <Divider className={styles.filterDivider} />
                    <fieldset>
                        <legend>
                            <Typography variant="h2">Availability</Typography>
                        </legend>
                        <Field name="in_stock" component={CheckboxAvailability} />
                    </fieldset>
                    <Divider className={styles.filterDivider} />
                    <fieldset>
                        <legend>
                            <Typography variant="h2">Categories</Typography>
                        </legend>
                        {isCategoriesLoading ? (
                            <LinearProgress data-testid="categories-linear-progress" />
                        ) : (
                            <Field
                                name="categories"
                                component={CheckboxCategory}
                                options={categories}
                            />
                        )}
                    </fieldset>
                </form>
            </Paper>
            <div className={styles.filterBtns}>
                <Button
                    type="reset"
                    color="secondary"
                    onClick={handleReset}
                    disabled={isHardwareLoading}
                >
                    Clear all
                </Button>
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    fullWidth={true}
                    className={styles.filterBtnsApply}
                    disabled={isHardwareLoading}
                    disableElevation
                >
                    Apply
                </Button>
            </div>
        </div>
    );
};

export const EnhancedInventoryFilter = () => {
    const dispatch = useDispatch();

    const onSubmit = ({ ordering, in_stock, categories }: InventoryFilterValues) => {
        const filters: HardwareFilters = {
            ordering,
            in_stock: in_stock || undefined, // If false, it will be cleared below
            category_ids: categories.map((id) => parseInt(id, 10)),
        };

        dispatch(setFilters(filters));
        dispatch(getHardwareWithFilters());
    };

    const onReset = () => {
        dispatch(clearFilters({ saveSearch: true }));
        dispatch(getHardwareWithFilters());
    };

    const initialValues: InventoryFilterValues = {
        ordering: "",
        in_stock: false,
        categories: [],
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            onReset={onReset}
            validateOnBlur={false}
            validationOnChange={false}
        >
            {(formikProps) => <InventoryFilter {...formikProps} />}
        </Formik>
    );
};

export default EnhancedInventoryFilter;
