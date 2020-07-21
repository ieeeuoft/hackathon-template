import React from "react";
import styles from "./InventoryFilter.module.scss";
import { Formik, Field, Form } from "formik";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CircularProgress from "@material-ui/core/CircularProgress";
import { inventoryCategories } from "testing/mockData";
import { TRUE } from "node-sass";

const FormikRadioGroup = ({ field, options, ...props }) => (
    <RadioGroup {...field} {...props} name={field.name}>
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

const FormikCategoryGroup = ({ field, options, ...props }) => (
    <FormGroup {...field} {...props} name={field.name}>
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

const FormikAvailabilityGroup = ({ field, name, ...props }) => (
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

export const InventoryFilter = ({ handleReset, handleSubmit, isLoadingApply=true, isLoadingClear=true }) => (
    <div className={styles.filter}>
        <Paper className={styles.filterPaper} square={true} elevation={3}>
            <Form onReset={handleReset} onSubmit={handleSubmit}>
                <fieldset>
                    <legend>
                        <Typography variant="h2">Order by</Typography>
                    </legend>
                    <Field
                        name="orderBy"
                        component={FormikRadioGroup}
                        options={orderByOptions}
                    />
                </fieldset>
                <Divider className={styles.filterDivider} />
                <fieldset>
                    <legend>
                        <Typography variant="h2">Availability</Typography>
                    </legend>
                    <Field name="inStock" component={FormikAvailabilityGroup} />
                </fieldset>
                <Divider className={styles.filterDivider} />
                <fieldset>
                    <legend>
                        <Typography variant="h2">Categories</Typography>
                    </legend>
                    <Field
                        name="inventoryCategories"
                        component={FormikCategoryGroup}
                        options={inventoryCategories}
                    />
                </fieldset>
            </Form>
        </Paper>
        <div className={styles.filterBtns}>
            <Button
                type="submit"
                onClick={handleSubmit}
                color="primary"
                variant="contained"
                fullWidth={true}
                className={styles.filterBtnsApply}
                disabled={isLoadingApply || isLoadingClear}
            >
                <Typography>Apply</Typography>
                {isLoadingApply && (
                    <CircularProgress
                        className={styles.formCircularProgress}
                        size={20}
                        // data-testid={TEST_IDS.circularProgress}
                    />
                )}
                
            </Button>
            <Button type="reset" color="secondary" onClick={handleReset} disabled={isLoadingApply || isLoadingClear}>
                <Typography>Clear all</Typography>
                {isLoadingClear && (
                    <CircularProgress
                        className={styles.formCircularProgress}
                        size={20}
                        // data-testid={TEST_IDS.circularProgress}
                    />
                )}
                
            </Button>
        </div>
    </div>
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const EnhancedInventoryFilter = () => {
    return (
        <Formik
            initialValues={{
                orderBy: "Default",
                inStock: false,
                inventoryCategories: [],
            }}
            onSubmit={async (values) => {
                await sleep(500);
                alert(JSON.stringify(values, null, 2));
            }}
        >
            {(formikProps) => (
                <InventoryFilter {...formikProps} categories={inventoryCategories} />
            )}
        </Formik>
    );
};

export default EnhancedInventoryFilter;
