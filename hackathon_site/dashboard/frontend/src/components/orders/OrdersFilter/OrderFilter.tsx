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
import { OrderOrdering, OrderStatus, OrderFilters } from "api/types";
import styles from "components/sharedStyles/Filter.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    adminOrderNumStatusesSelector,
    clearFilters,
    getOrdersWithFilters,
    setFilters,
} from "slices/order/adminOrderSlice";

export type OrderByOptions = {
    value: OrderOrdering;
    label: string;
}[];

type StatusCategories = [
    {
        status: OrderStatus;
        numOrders: number;
    }
];

const orderByOptions: OrderByOptions = [
    { value: "", label: "Default" },
    { value: "created_at", label: "Time Ordered (ASC)" },
    { value: "-created_at", label: "Time Ordered (DESC)" },
];

const RadioOrderBy = ({ field, options }: FieldProps & { options: OrderByOptions }) => (
    <RadioGroup {...field} name={field.name}>
        {options.map((item, i) => (
            <FormControlLabel
                name={field.name}
                value={item.value}
                label={item.label}
                data-testid={item.label}
                control={<Radio color="primary" />}
                checked={field.value === item.value}
                key={i}
            />
        ))}
    </RadioGroup>
);

const OrderFilter = ({ handleReset, handleSubmit }: FormikValues) => {
    const CheckboxCategory = ({
        field,
        options,
    }: FieldProps & { options: StatusCategories }) => (
        <FormGroup {...field}>
            {options.map((item, i) => (
                <div className={styles.filterCategory} key={i}>
                    <FormControlLabel
                        name={field.name}
                        data-testid={item.status}
                        value={item.status}
                        control={<Checkbox color="primary" />}
                        label={item.status}
                        checked={
                            field.value ? field.value.includes(item.status) : false
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

    const numStatuses = useSelector(adminOrderNumStatusesSelector);

    const statusCategories = [
        {
            status: "Submitted",
            numOrders: numStatuses["Submitted"],
        },
        {
            status: "Ready for Pickup",
            numOrders: numStatuses["Ready for Pickup"],
        },
        {
            status: "Picked Up",
            numOrders: numStatuses["Picked Up"],
        },
        {
            status: "Cancelled",
            numOrders: numStatuses["Cancelled"],
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
                            options={statusCategories}
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
    const dispatch = useDispatch();

    const handleSubmit = ({ ordering, status }: OrderFilters) => {
        const filters: OrderFilters = {
            ordering,
            status,
        };
        dispatch(setFilters(filters));
        dispatch(getOrdersWithFilters());
    };

    const handleReset = () => {
        dispatch(clearFilters());
        dispatch(getOrdersWithFilters());
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
