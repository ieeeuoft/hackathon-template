import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";

import styles from "./SnackbarNotifier.module.scss";
import { snackbarSelector, dismissSnackbar, removeSnackbar } from "slices/ui/uiSlice";

export const UnconnectedSnackbarNotifier = ({
    snackbars,
    dismissSnackbar,
    removeSnackbar,
    enqueueSnackbar,
    closeSnackbar,
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

        if (snackbars?.length) {
            snackbars.forEach(({ message, options, dismissed }) => {
                if (dismissed) {
                    closeSnackbar(options.key);
                    return;
                }

                if (displayedSnackbars.has(options.key)) return;

                enqueueSnackbar(message, {
                    ...options,
                    onClose: (event, reason, myKey) => {
                        if (options.onClose) {
                            options.onClose(event, reason, myKey);
                        }
                    },
                    onExited: (event, myKey) => {
                        // Remove this snackbar from the redux store
                        removeSnackbar({ key: myKey });
                        removeDisplayed(myKey);
                    },
                    action: (myKey) => (
                        // Actions shouldn't be stored in redux, since as functions
                        // they aren't serializable. This gives us a default close
                        // action on all snackbars.
                        <IconButton
                            onClick={() => {
                                dismissSnackbar({ key: myKey });
                            }}
                        >
                            <Close className={styles.close} />
                        </IconButton>
                    ),
                });

                storeDisplayed(options.key);
            });
        }
    }, [
        snackbars,
        displayedSnackbars,
        dismissSnackbar,
        removeSnackbar,
        enqueueSnackbar,
        closeSnackbar,
    ]);

    return null;
};

const mapStateToProps = (state) => ({
    snackbars: snackbarSelector(state),
});

export const ConnectedSnackbarNotifier = connect(mapStateToProps, {
    dismissSnackbar,
    removeSnackbar,
})(withSnackbar(UnconnectedSnackbarNotifier));

export default ConnectedSnackbarNotifier;
