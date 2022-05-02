import React from "react";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import { Formik, FormikValues } from "formik";

import styles from "pages/Inventory/Inventory.module.scss";
import {
    setFilters,
    getHardwareWithFilters,
    isLoadingSelector,
} from "slices/hardware/hardwareSlice";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "slices/store";
import { Box } from "@material-ui/core";

interface SearchValues {
    search: string;
}

export const InventorySearch = ({
    handleChange,
    handleReset,
    handleSubmit,
    values: { search },
}: FormikValues) => (
    <form onReset={handleReset} onSubmit={handleSubmit} autoComplete="off">
        <Box display="flex" flexDirection="row">
            <TextField
                className={styles.inventoryBodyToolbarSearch}
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
            >
                <SearchIcon />
            </IconButton>
        </Box>
    </form>
);

export const EnhancedInventorySearch = ({
    getHardwareWithFilters,
    setFilters,
}: ConnectedInventorySearchProps) => {
    const initialValues = {
        search: "",
    };

    const onSubmit = ({ search }: SearchValues) => {
        setFilters({ search });
        getHardwareWithFilters();
    };

    const onReset = () => {
        setFilters(initialValues);
        getHardwareWithFilters();
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            onReset={onReset}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {(formikProps) => <InventorySearch {...formikProps} />}
        </Formik>
    );
};

const mapStateToProps = (state: RootState) => ({
    isLoading: isLoadingSelector(state),
});

const connector = connect(mapStateToProps, {
    getHardwareWithFilters,
    setFilters,
});

type ConnectedInventorySearchProps = ConnectedProps<typeof connector>;

export const ConnectedInventorySearch = connector(EnhancedInventorySearch);

export default ConnectedInventorySearch;
