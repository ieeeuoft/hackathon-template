import { Box } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import styles from "components/team/TeamSearchBar/TeamSearchBar.module.scss";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import { getTeamsWithSearchThunk } from "slices/event/teamAdminSlice";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Formik, FormikValues } from "formik";

interface SearchValues {
    search: string;
}

const TeamSearchBar = ({
    handleChange,
    handleReset,
    handleSubmit,
    values: { search },
}: FormikValues) => {
    return (
        <form
            onReset={handleReset}
            onSubmit={handleSubmit}
            autoComplete="off"
            className={styles.searchBar}
        >
            <Box display="flex" flexDirection="row">
                <TextField
                    id="search-input"
                    name="search"
                    label="Search items"
                    variant="outlined"
                    type="text"
                    value={search}
                    onChange={handleChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleReset}>
                                    <CloseIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton color="primary" aria-label="Search" onClick={handleSubmit}>
                    <SearchIcon />
                </IconButton>
            </Box>
        </form>
    );
};

export const TeamSearch = () => {
    const initialValues = {
        search: "",
    };

    const dispatch = useDispatch();

    const onSubmit = ({ search }: SearchValues) => {
        dispatch(getTeamsWithSearchThunk(search));
    };

    const onReset = () => {
        dispatch(getTeamsWithSearchThunk(initialValues.search));
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            onReset={onReset}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {(formikProps) => <TeamSearchBar {...formikProps} />}
        </Formik>
    );
};

export default TeamSearch;
