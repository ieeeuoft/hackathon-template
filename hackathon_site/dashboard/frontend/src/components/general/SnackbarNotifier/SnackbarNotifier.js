import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";

import { snackbarSelector, actions as uiActions } from "slices/ui/uiSlice";

export const UnconnectedSnackbarNotifier = ({
    snackbars,
    enqueueSnackbar,
    closeSnackbar,
    removeSnackbar,
}) => {
    const [displayedSnackbars, setDisplayedSnackbars] = useState(new Set());

    useEffect(() => {
        const storeDisplayed = (key) => {
            displayedSnackbars.add(key);
            setDisplayedSnackbars(displayedSnackbars);
        };

        const removeDisplayed = (key) => {
            displayedSnackbars.delete(key);
            setDisplayedSnackbars(displayedSnackbars);
        };

        snackbars.forEach(({ message, options, key, dismissed }) => {
            if (dismissed) {
                closeSnackbar(key);
                return;
            }

            if (displayedSnackbars[key]) return;

            enqueueSnackbar(message, {
                ...options,
                key,
                onClose: (event, reason, myKey) => {
                    console.log("I was called");
                    if (options.onClose) {
                        console.log("I got here");
                        options.onClose(event, reason, myKey);
                    }
                },
                onExited: (event, myKey) => {
                    // Remove this snackbar from the redux store
                    removeSnackbar({ key: myKey });
                    removeDisplayed(myKey);
                },
            });

            storeDisplayed(key);
        });
    }, [snackbars, displayedSnackbars, enqueueSnackbar, closeSnackbar, removeSnackbar]);

    return null;
};

const mapStateToProps = (state) => ({
    snackbars: snackbarSelector(state),
});

export const ConnectedSnackbarNotifier = connect(mapStateToProps, {
    removeSnackbar: uiActions.removeSnackbar,
})(withSnackbar(UnconnectedSnackbarNotifier));

export default ConnectedSnackbarNotifier;
