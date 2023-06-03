import React from "react";
import { Box, IconButton, InputAdornment, TextField } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import styles from "pages/Orders/Orders.module.scss";
import { Formik, FormikValues } from "formik";
import { RootState } from "slices/store";
import { connect, ConnectedProps } from "react-redux";
import {
    getOrdersWithFilters,
    isLoadingSelector,
    setFilters,
} from "slices/order/adminOrderSlice";

interface SearchValues {
    search: string;
}

const OrdersSearch = ({
    values: { search },
    handleChange,
    handleReset,
    handleSubmit,
}: FormikValues) => {
    return (
        <form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
            <Box display="flex" flexDirection="row">
                <TextField
                    className={styles.ordersBodyToolbarSearch}
                    id="search-input"
                    name="search"
                    label="Search items"
                    variant="outlined"
                    type="text"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleReset}
                                    data-testid="clear-button"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    value={search}
                    onChange={handleChange}
                />
                <IconButton
                    color="primary"
                    aria-label="Search"
                    onClick={handleSubmit}
                    data-testid="search-button"
                    className={styles.ordersBodyToolbarIconButton}
                >
                    <SearchIcon />
                </IconButton>
            </Box>
        </form>
    );
};

export const EnhancedOrderSearch = ({
    getOrdersWithFilters,
    setFilters,
}: ConnectedOrderSearchProps) => {
    const initialValues = {
        search: "",
    };

    const onSubmit = ({ search }: SearchValues) => {
        setFilters({ search });
        getOrdersWithFilters();
    };

    const onReset = () => {
        setFilters(initialValues);
        getOrdersWithFilters();
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            onReset={onReset}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {(formikProps) => <OrdersSearch {...formikProps} />}
        </Formik>
    );
};

const mapStateToProps = (state: RootState) => ({
    isLoading: isLoadingSelector(state),
});

const connector = connect(mapStateToProps, {
    getOrdersWithFilters,
    setFilters,
});

type ConnectedOrderSearchProps = ConnectedProps<typeof connector>;

export const ConnectedOrderSearch = connector(EnhancedOrderSearch);

export default ConnectedOrderSearch;
