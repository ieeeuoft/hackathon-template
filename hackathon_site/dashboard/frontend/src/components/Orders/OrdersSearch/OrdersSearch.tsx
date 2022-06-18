import React from "react";
import { Box, IconButton, InputAdornment, TextField } from "@material-ui/core";
import { FormikValues } from "formik";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import styles from "pages/Orders/Orders.module.scss";

const OrdersSearch = ({
    handleChange,
    handleReset,
    handleSubmit,
}: // values: { search },
FormikValues) => {
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
                    // value={search}
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

export default OrdersSearch;
