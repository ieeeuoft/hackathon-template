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
import { OrderStatus } from "api/types";
import { status } from "testing/mockData";
import styles from "components/sharedStyles/Filter.module.scss";

type OrdersOrdering = "" | "timeOrderedASC" | "timeOrderedDESC" | "orderQuantity";

type OrderByOptions = {
    value: OrdersOrdering;
    label: string;
}[];

type StatusCategories = [
    {
        status: OrderStatus;
        numOrders: number;
    }
];

interface OrdersFilterValues {
    ordering: OrdersOrdering;
    status: OrderByOptions;
}

const orderByOptions: OrderByOptions = [
    { value: "", label: "Default" },
    { value: "timeOrderedASC", label: "Time Ordered (ASC)" },
    { value: "timeOrderedDESC", label: "Time Ordered (DESC)" },
    { value: "orderQuantity", label: "Order Quantity" },
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

const CheckboxCategory = ({
    field,
    options,
}: FieldProps & { options: StatusCategories }) => (
    <FormGroup {...field}>
        {options.map((item, i) => (
            <div className={styles.filterCategory} key={i}>
                <FormControlLabel
                    name={field.name}
                    value={item.status}
                    control={<Checkbox color="primary" />}
                    label={item.status}
                    checked={field.value ? field.value.includes(item.status) : false}
                />
                <Chip
                    size="small"
                    label={item.numOrders}
                    className={styles.filterCategoryChip}
                />
            </div>
        ))}
    </FormGroup>
);

const OrderFilter = ({ handleReset, handleSubmit }: FormikValues) => {
    return (
        <div className={styles.filter}>
            <Paper elevation={2} className={styles.filterPaper} square={true}>
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
                    <Divider
                        className={styles.filterDivider}
                        data-testid="orderFilterDivider"
                    />
                    <fieldset>
                        <legend>
                            <Typography variant="h2">Status</Typography>
                        </legend>
                        <Field
                            name="status"
                            component={CheckboxCategory}
                            options={status}
                        />
                    </fieldset>
                </form>
            </Paper>
            <div className={styles.filterBtns}>
                <Button
                    type="reset"
                    color="secondary"
                    onClick={handleReset}
                    data-testid="clear-button"
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
                    disableElevation
                    data-testid="apply-button"
                >
                    Apply
                </Button>
            </div>
        </div>
    );
};

export const EnhancedOrderFilter = () => {
    const handleSubmit = ({ ordering, status }: OrdersFilterValues) => {
        // TODO
        alert("The apply button has been clicked.");

        console.log("ordering: ", ordering);
        console.log("statuses: ", status);
    };

    const handleReset = () => {
        // TODO
    };

    return (
        <Formik
            initialValues={{
                ordering: "",
                status: [],
            }}
            onSubmit={handleSubmit}
            onReset={handleReset}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {(formikProps) => <OrderFilter {...formikProps} />}
        </Formik>
    );
};

export default EnhancedOrderFilter;
