import React from "react";
import { IconButton } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import { FormikValues } from "formik";

const OrdersFilter = ({ handleSubmit }: FormikValues) => {
    return (
        <IconButton
            color="primary"
            aria-label="Filter"
            onClick={handleSubmit}
            data-testid="filter-button"
        >
            <FilterListIcon color="primary" />
        </IconButton>
    );
};

export default OrdersFilter;
