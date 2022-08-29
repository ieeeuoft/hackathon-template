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

const TeamSearchBar = () => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");
    const handleSubmit = (search: string) => {
        dispatch(getTeamsWithSearchThunk(search));
    };

    const handleChange = (e: any) => {
        setSearch(e.target.value);
    };

    return (
        <form autoComplete="off" className={styles.searchBar}>
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
                                <IconButton>
                                    <CloseIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton
                    color="primary"
                    aria-label="Search"
                    onClick={() => handleSubmit(search)}
                >
                    <SearchIcon />
                </IconButton>
            </Box>
        </form>
    );
};

export default TeamSearchBar;
