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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { inventoryCategories } from "testing/mockData";

export const InventoryFilter = ({ 
    // errors,
    // handleChange,
    handleReset,
    handleSubmit,
    categories, 
    // applyFilter, 
    // removeFilter, 
}) => (
    <div className={styles.filter}>
        <Paper className={styles.filterPaper} square={true} elevation={3}>
            <Form onReset={handleReset} onSubmit={handleSubmit}> 
                <fieldset>
                    <legend>
                        <Typography variant="h2">
                            Order by
                        </Typography>
                    </legend>
                    <RadioGroup aria-label="order by" name="orderBy">
                        <FormControlLabel
                            name="all"
                            value="all"
                            label="All"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="a-z"
                            value="a-z"
                            label="A-Z"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="z-a"
                            value="z-a"
                            label="Z-A"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="stock-high-low"
                            value="stock-high-low"
                            label="Stock remaining: high to low"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="stock-low-high"
                            value="stock-low-high"
                            label="Stock remaining: low to high"
                            control={<Radio color="primary" />}
                        />
                    </RadioGroup>
                </fieldset>
                <Divider className={styles.filterDivider} />
                <fieldset>
                    <legend>
                        <Typography variant="h2">
                            Availability
                        </Typography>
                    </legend>
                    {/* <Field name="inStock" type="checkbox" /> */}
                    <FormControlLabel
                        name="inStock"
                        value="in-stock"
                        control={<Checkbox color="primary" />}
                        label="In stock"
                    />
                </fieldset>
                <Divider className={styles.filterDivider} />
                <fieldset>
                    <legend>
                        <Typography variant="h2">
                            Categories
                        </Typography>
                    </legend>
                    {categories.map((item, i) => (
                        <div className={styles.filterCategory} key={i}>
                            <FormControlLabel
                                name="inventoryCategories"
                                value={`category-${item.id}`}
                                control={<Checkbox color="primary" />}
                                label={item.name}
                            />
                            <Chip label={item.qty} className={styles.filterCategoryChip} />
                        </div>
                    ))}
                </fieldset>
            </Form>
        </Paper>
        <div className={styles.filterBtns}>
            <Button
                type="submit"
                onClick={handleSubmit}
                // onClick={applyFilter}
                color="primary"
                variant="contained"
                fullWidth={true}
                className={styles.filterBtnsApply}
            >
                Apply
            </Button>
            <Button type="reset" color="secondary" onClick={handleReset}>
                Clear all
            </Button>
        </div>
    </div>
);

const applyFilter = () => alert("Applies the filter");

const removeFilter = () => alert("Removes all filters and resets form");


const sleep = ms => new Promise(r => setTimeout(r, ms));

export const EnhancedInventoryFilter = () => {
    return (
        <Formik
            initialValues={{ orderBy: "", inStock: false, inventoryCategories: [] }}
            onSubmit={async values => {
                await sleep(500);
                alert(JSON.stringify(values, null, 2));
            }}
        >
            {(formikProps) => (
                <InventoryFilter
                    {...formikProps}
                    categories={inventoryCategories}
                    // applyFilter={applyFilter}
                    // removeFilter={removeFilter}
                />
            )}
        </Formik>
    );
};


export default EnhancedInventoryFilter;
// export default InventoryFilter;
