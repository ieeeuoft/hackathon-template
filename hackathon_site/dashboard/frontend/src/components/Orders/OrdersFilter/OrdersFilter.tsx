import React from "react";
import { IconButton } from "@material-ui/core";
import { FormikValues } from "formik";
import FilterListIcon from "@material-ui/icons/FilterList";

const OrdersFilter = ({ handleSubmit }: FormikValues) => {
    return (
        <>
            <IconButton
                color="primary"
                aria-label="Search"
                onClick={handleSubmit}
                data-testid="search-button"
            >
                <FilterListIcon color="primary" />
            </IconButton>
        </>
    );
};

export default OrdersFilter;
