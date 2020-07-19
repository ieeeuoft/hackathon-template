import React from "react";
import styles from "./InventoryFilter.module.scss";
import { Formik } from "formik";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const InventoryFilter = ({ 
    errors,
    handleChange,
    handleReset,
    handleSubmit,
    isLoading,
    categories, 
    applyFilter, 
    removeFilter, 
    elevation = 3 
}) => (
    <div className={styles.filter}>
        <Paper className={styles.filterPaper} square={true} elevation={elevation}>
            <form>
                <fieldset>
                    <legend>
                        <Typography variant="h2">
                            Order by
                        </Typography>
                    </legend>
                    <RadioGroup aria-label="order by" name="order by">
                        <FormControlLabel
                            value="all"
                            control={<Radio color="primary" />}
                            label="All"
                        />
                        <FormControlLabel
                            value="a-z"
                            control={<Radio color="primary" />}
                            label="A-Z"
                        />
                        <FormControlLabel
                            value="z-a"
                            control={<Radio color="primary" />}
                            label="Z-A"
                        />
                        <FormControlLabel
                            value="stock-high-low"
                            control={<Radio color="primary" />}
                            label="Stock remaining: high to low"
                        />
                        <FormControlLabel
                            value="stock-low-high"
                            control={<Radio color="primary" />}
                            label="Stock remaining: low to high"
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
                    <FormControlLabel
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
                                control={<Checkbox color="primary" />}
                                label={item.name}
                                name={`category-${item.id}`}
                            />
                            <Chip label={item.qty} className={styles.filterCategoryChip} />
                        </div>
                    ))}
                </fieldset>
            </form>
        </Paper>
        <Button
            color="primary"
            variant="contained"
            fullWidth={true}
            onClick={applyFilter}
            className={styles.filterBtn}
        >
            Apply
        </Button>
        <Button color="secondary" onClick={removeFilter}>
            Clear all
        </Button>
    </div>
);


export const EnhancedInventoryFilter = ({ handleLogin, isLoading, requestFailure }) => {
    const onSubmit = (formikValues) => {
        handleLogin({ email: formikValues.email, password: formikValues.password });
    };

    return (
        <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            validateOnBlur={false}
            validateOnChange={false}
            // validationSchema={InventoryFormSchema}
        >
            {(formikProps) => (
                <InventoryFilter
                    {...formikProps}
                    isLoading={isLoading}
                    requestFailure={requestFailure}
                />
            )}
        </Formik>
    );
};


export default EnhancedInventoryFilter;
