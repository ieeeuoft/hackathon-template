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
import { OrdersOrdering, OrderStatus } from "api/types";
import styles from "components/global_css/Filter.module.scss";

type OrderByOptions = {
    value: OrdersOrdering;
    label: string;
}[];

type StatusCategories = [
    {
        id: Number;
        status: OrderStatus;
        numOrders: Number;
    }
];

const orderByOptions: OrderByOptions = [
    { value: "", label: "Default" },
    { value: "timeOrderedASC", label: "Time Ordered (ASC)" },
    { value: "timeOrderedDESC", label: "Time Ordered (DESC)" },
    { value: "OrderQuality", label: "Order Quantity" },
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
                    value={item.id}
                    control={<Checkbox color="primary" />}
                    label={item.status}
                    checked={
                        field.value ? field.value.includes(item.id.toString()) : false
                    }
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
    const status = [
        {
            id: 1,
            status: "Pending",
            numOrders: 2,
        },
        {
            id: 2,
            status: "Ready for Pick up",
            numOrders: 4,
        },
        {
            id: 3,
            status: "Checked out",
            numOrders: 4,
        },
    ];

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
    const onSubmit = ({ ordering, status }: any) => {
        // TODO
        alert("The apply button has been clicked.");

        console.log("ordering: ", ordering);
        console.log("statuses: ", status);
    };

    const onReset = () => {
        // TODO
    };

    return (
        <Formik
            initialValues={{
                ordering: "",
                status: [],
            }}
            onSubmit={onSubmit}
            onReset={onReset}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {(formikProps) => <OrderFilter {...formikProps} />}
        </Formik>
    );
};

export default EnhancedOrderFilter;
