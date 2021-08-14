import React from "react";
import styles from "./InventoryFilter.module.scss";
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
import { inventoryCategories } from "testing/mockData";
import CircularProgress from "@material-ui/core/CircularProgress";

import { Category, HardwareOrdering } from "api/types";

type OrderByOptions = {
    value: HardwareOrdering;
    label: string;
}[];

export const orderByOptions: OrderByOptions = [
    { value: "", label: "Default" },
    { value: "name", label: "A-Z" },
    { value: "-name", label: "Z-A" },
    { value: "quantity_remaining", label: "Stock remaining: high to low" },
    { value: "-quantity_remaining", label: "Stock remaining: low to high" },
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
    order_by: string;
    in_stock: boolean;
    // Categories is a string array because html checkboxes have string values
    categories: string[];
}

type InventoryFilterProps = FormikValues & {
    categories: Category[];
    isApplyLoading: boolean;
    isClearLoading: boolean;
};

export const InventoryFilter = ({
    handleReset,
    handleSubmit,
    categories,
    isApplyLoading,
    isClearLoading,
}: InventoryFilterProps) => (
    <div className={styles.filter}>
        <Paper elevation={2} className={styles.filterPaper} square={true}>
            <form onReset={handleReset} onSubmit={handleSubmit}>
                <fieldset>
                    <legend>
                        <Typography variant="h2">Order by</Typography>
                    </legend>
                    <Field
                        name="order_by"
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
                    <Field
                        name="categories"
                        component={CheckboxCategory}
                        options={categories}
                    />
                </fieldset>
            </form>
        </Paper>
        <div className={styles.filterBtns}>
            <Button
                type="reset"
                color="secondary"
                onClick={handleReset}
                disabled={isApplyLoading || isClearLoading}
            >
                Clear all
                {isClearLoading && (
                    <CircularProgress
                        className={styles.filterCircularProgress}
                        size={20}
                        data-testid="circularProgressClear"
                    />
                )}
            </Button>
            <Button
                type="submit"
                onClick={handleSubmit}
                color="primary"
                variant="contained"
                fullWidth={true}
                className={styles.filterBtnsApply}
                disabled={isApplyLoading || isClearLoading}
                disableElevation
            >
                Apply
                {isApplyLoading && (
                    <CircularProgress
                        className={styles.filterCircularProgress}
                        size={20}
                        data-testid="circularProgressApply"
                    />
                )}
            </Button>
        </div>
    </div>
);

interface EnhancedInventoryFilterProps {
    handleSubmit: (arg: any) => void;
    handleReset: (arg: any) => void;
    isApplyLoading: boolean;
    isClearLoading: boolean;
}
export const EnhancedInventoryFilter = ({
    handleSubmit,
    handleReset,
    isApplyLoading,
    isClearLoading,
}: EnhancedInventoryFilterProps) => {
    const onSubmit = ({ order_by, in_stock, categories }: InventoryFilterValues) => {
        handleSubmit({
            order_by,
            in_stock,
            categories: categories.map((id) => parseInt(id, 10)),
        });
    };
    const onReset = () => {
        handleReset({ order_by: "", in_stock: false, categories: [] });
    };

    const initialValues: InventoryFilterValues = {
        order_by: "",
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
            {(formikProps) => (
                <InventoryFilter
                    {...formikProps}
                    categories={inventoryCategories}
                    isApplyLoading={isApplyLoading}
                    isClearLoading={isClearLoading}
                />
            )}
        </Formik>
    );
};

export default EnhancedInventoryFilter;
