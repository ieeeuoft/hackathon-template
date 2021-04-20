import React from "react";
import styles from "./InventoryFilter.module.scss";
import { Formik, Field } from "formik";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { inventoryCategories } from "testing/mockData";
import CircularProgress from "@material-ui/core/CircularProgress";

const RadioOrderBy = ({ field, options }) => (
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

const CheckboxCategory = ({ field, options }) => (
    <FormGroup {...field} name={field.name}>
        {options.map((item, i) => (
            <div className={styles.filterCategory} key={i}>
                <FormControlLabel
                    name={field.name}
                    value={item.name}
                    control={<Checkbox color="primary" />}
                    label={item.name}
                    checked={field.value.includes(item.name)}
                />
                <Chip label={item.qty} className={styles.filterCategoryChip} />
            </div>
        ))}
    </FormGroup>
);

const CheckboxAvailability = ({ field, name, ...props }) => (
    <FormGroup {...field} {...props} name={field.name}>
        <FormControlLabel
            label="In stock"
            name={field.name}
            value="In stock"
            control={<Checkbox color="primary" />}
            checked={field.value}
        />
    </FormGroup>
);

export const orderByOptions = [
    { value: "Default", label: "Default" },
    { value: "A-Z", label: "A-Z" },
    { value: "Z-A", label: "Z-A" },
    { value: "Stock remaining: high to low", label: "Stock remaining: high to low" },
    { value: "Stock remaining: low to high", label: "Stock remaining: low to high" },
];

export const InventoryFilter = ({
    handleReset,
    handleSubmit,
    categories,
    isApplyLoading,
    isClearLoading,
}) => (
    <div className={styles.filter}>
        <form onReset={handleReset} onSubmit={handleSubmit}>
            <fieldset>
                <legend>
                    <Typography variant="h2">Order by</Typography>
                </legend>
                <Field
                    name="orderBy"
                    component={RadioOrderBy}
                    options={orderByOptions}
                />
            </fieldset>
            <Divider className={styles.filterDivider} />
            <fieldset>
                <legend>
                    <Typography variant="h2">Availability</Typography>
                </legend>
                <Field name="inStock" component={CheckboxAvailability} />
            </fieldset>
            <Divider className={styles.filterDivider} />
            <fieldset>
                <legend>
                    <Typography variant="h2">Categories</Typography>
                </legend>
                <Field
                    name="inventoryCategories"
                    component={CheckboxCategory}
                    options={categories}
                />
            </fieldset>
        </form>
        <div className={styles.filterBtns}>
            <Button
                type="submit"
                onClick={handleSubmit}
                color="primary"
                variant="contained"
                fullWidth={true}
                className={styles.filterBtnsApply}
                disabled={isApplyLoading || isClearLoading}
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
        </div>
    </div>
);

export const EnhancedInventoryFilter = ({
    handleSubmit,
    handleReset,
    isApplyLoading,
    isClearLoading,
}) => {
    const onSubmit = (formikValues) => {
        const { orderBy, inStock, inventoryCategories } = formikValues;
        handleSubmit({ orderBy, inStock, inventoryCategories });
    };
    const onReset = () => {
        handleReset({ orderBy: "Default", inStock: false, inventoryCategories: [] });
    };

    return (
        <Formik
            initialValues={{
                orderBy: "Default",
                inStock: false,
                inventoryCategories: [],
            }}
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
