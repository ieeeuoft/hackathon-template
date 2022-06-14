import { Box } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import styles from "components/team/TeamSearchBar/TeamSearchBar.module.scss";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";

const TeamSearchBar = () => (
    <form autoComplete="off" className={styles.searchBar}>
        <Box display="flex" flexDirection="row">
            <TextField
                id="search-input"
                name="search"
                label="Search items"
                variant="outlined"
                type="text"
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
            <IconButton color="primary" aria-label="Search">
                <SearchIcon />
            </IconButton>
        </Box>
    </form>
);

export default TeamSearchBar;
